using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.JsonPatch.Internal;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;

public class ScheduleRequest
{
    [JsonPropertyName("terms")]
    public List<TermModel> Terms { get; set; }

    [JsonPropertyName("message")]
    public string Message { get; set; }
}

public class SendCourseUpdate{
    [JsonPropertyName("message")]
    public string Message { get; set; }

    [JsonPropertyName("course")]
    public CourseModel Course { get; set; }

    [JsonPropertyName("termIndex")]
    public string TermIndex { get; set; }

    [JsonPropertyName("prevTermIndex")]
    public string PreviousTermIndex { get; set; }
}


[ApiController]
[Route("api/[controller]")]
public class SchedulerController : ControllerBase
{
    private readonly ILogger<SchedulerController> _logger;
    private ScheduleModel _scheduleModel;

    private RequisitesHandler _requisitesHandler;
    private LoggerFactory _loggerFactory;
    private Logger<PrereqTree> _loggerPrereqTree;

    public SchedulerController(ILogger<SchedulerController> logger, ScheduleModel scheduleModel, RequisitesHandler requisitesHandler)
    {
        _logger = logger;
        _scheduleModel = scheduleModel;
        _loggerFactory = new LoggerFactory();
        _loggerPrereqTree = new Logger<PrereqTree>(_loggerFactory);
        _requisitesHandler = requisitesHandler;
    }
    // GET: api/scheduler
    [HttpGet]
    public IActionResult Get()
    {
        _logger.LogInformation("GET request received at api/example.");
        return Ok("Hello from the SchedulerController!");
    }

    // GET: api/scheduler/greet
    [HttpGet("greet")]
    public IActionResult Greet()
    {
        _logger.LogInformation("GET request received at api/example/greet.");
        return Ok("Greetings from the ExampleController!");
    }

    // POST: api/scheduler/sendCourseUpdate
    [HttpPost("sendCourseUpdate")]
    public IActionResult SendCourseUpdate([FromBody] JsonDocument jsonDoc) {
        JsonElement root = jsonDoc.RootElement;

        string Message = root.GetProperty("Message").ToString();
        JsonElement courseIdElement = root.GetProperty("Course");
        int termIndex = Convert.ToInt32(root.GetProperty("TermIndex").ToString());

        _logger.LogInformation("POST request received with message: {Message} for SendCourseUpdate", Message);

        CourseModel Course = new CourseModel(courseIdElement.GetProperty("shortName").GetString(), 
            courseIdElement.GetProperty("fullName").GetString(), 
            courseIdElement.GetProperty("courseCredits").GetString(), 
            courseIdElement.GetProperty("courseDesc").GetString(), 
            courseIdElement.GetProperty("courseDepartment").GetString(), 
            courseIdElement.GetProperty("repeatStatus").GetString(), 
            courseIdElement.GetProperty("prereqs").GetString(), 
            courseIdElement.GetProperty("coreqs").GetString(), 
            courseIdElement.GetProperty("restrictions").GetString(), 
            courseIdElement.GetProperty("offered").GetString(),
            courseIdElement.GetProperty("completedPreReqs").GetBoolean(),
            courseIdElement.GetProperty("completedCoReqs").GetBoolean(),
            courseIdElement.GetProperty("id").GetString());

        _logger.LogInformation($"Course {Course.Id} received with term index {termIndex}");
        int previousTermIndex = _scheduleModel.GetCourseTermIndex(Course, true);
        if (previousTermIndex != -1) { // Course is being created
            _logger.LogInformation($"Removing course {Course.ShortName} from term {previousTermIndex}");
            _scheduleModel.RemoveCourseFromTerm(Course, previousTermIndex);
        }
        if (termIndex != -1) {//Course is being deleted
            _logger.LogInformation($"Adding course {Course.ShortName} to term {termIndex}");
            _scheduleModel.AddCourseToTerm(Course, termIndex);
        }

        List<CourseModel> coursesNeedUpdating = new List<CourseModel>();
        Dictionary<string, bool> previousCoursePreReqsStatus = new Dictionary<string, bool>();
        foreach (CourseModel course in _scheduleModel.Terms.SelectMany(term => term.Courses))
        {
            _logger.LogInformation($"Checking course {course.ShortName} in term {_scheduleModel.GetCourseTermIndex(course)}");

            previousCoursePreReqsStatus.Add(course.Id, course.CompletedPreReqs);

            PrereqTree tree = new PrereqTree(course, _scheduleModel, _loggerPrereqTree, _requisitesHandler);
            tree.BuildTree();
            course.CompletedPreReqs = tree.IsPrereqSatisfied(tree.getRoot());
            if (course.CompletedPreReqs != previousCoursePreReqsStatus.GetValueOrDefault(course.Id, !course.CompletedPreReqs))
            {
                coursesNeedUpdating.Add(course);
            }
        }

        if (coursesNeedUpdating.Count > 0)
        {
            _logger.LogInformation($"Course needs updating {coursesNeedUpdating.Count}");
        }

        if (coursesNeedUpdating is null) {
            _logger.LogInformation("Schedule update failed.");
            return Ok(new
            {
                response = "Schedule update failed.",
                passedCourses = coursesNeedUpdating
            });
        }

        _logger.LogInformation("Schedule updated successfully.");
        return Ok(new
        {
            response = "Schedule updated successfully.",
            passedCourses = coursesNeedUpdating
        });
    }

    // POST: api/scheduler/initializeSchedule
    [HttpPost("initializeSchedule")]
    public IActionResult InitializeSchedule([FromBody] JsonDocument jsonDoc)
    {
        JsonElement root = jsonDoc.RootElement;

        string Message = root.GetProperty("Message").ToString();
        JsonElement termsElement = root.GetProperty("Terms");

        _logger.LogInformation("POST request received with message: {Message}", Message);

        List<TermModel> terms = new List<TermModel>();

        foreach (JsonElement termElement in termsElement.EnumerateArray())
        {
            string termId = termElement.GetProperty("id").GetString();
            string termName = termElement.GetProperty("termName").GetString();
            double termCredits = Convert.ToDouble(termElement.GetProperty("termCredits").GetString());
            List<CourseModel> courses = new List<CourseModel>();

            foreach (JsonElement courseElement in termElement.GetProperty("courses").EnumerateArray())
            {
                CourseModel course = new CourseModel(courseElement.GetProperty("shortName").GetString(), 
                    courseElement.GetProperty("fullName").GetString(), 
                    courseElement.GetProperty("courseCredits").GetString(), 
                    courseElement.GetProperty("courseDesc").GetString(), 
                    courseElement.GetProperty("courseDepartment").GetString(), 
                    courseElement.GetProperty("repeatStatus").GetString(), 
                    courseElement.GetProperty("prereqs").GetString(), 
                    courseElement.GetProperty("coreqs").GetString(), 
                    courseElement.GetProperty("restrictions").GetString(), 
                    courseElement.GetProperty("offered").GetString(),
                    courseElement.GetProperty("completedPreReqs").GetBoolean(),
                    courseElement.GetProperty("completedCoReqs").GetBoolean(),
                    courseElement.GetProperty("id").GetString());

                courses.Add(course);
            }

            terms.Add(new TermModel(termId, termName, termCredits, courses));
        }

        _scheduleModel.Terms = terms;

        return Ok(new
        {
            response = "Schedule initialized successfully.",
            receivedSchedule = terms
        });
    }
}
