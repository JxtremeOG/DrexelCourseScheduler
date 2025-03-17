using System.Configuration;
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

    public CourseModel CreateCourseObject(JsonElement courseElement)
    {
        string id = courseElement.TryGetProperty("id", out JsonElement idElement) 
            ? idElement.GetString() 
            : string.Empty;

        // Safely retrieve the "fullName" property
        string shortName = courseElement.TryGetProperty("shortName", out JsonElement shortNameElement) 
            ? shortNameElement.GetString() 
            : string.Empty;

        // Safely retrieve the "fullName" property
        string fullName = courseElement.TryGetProperty("fullName", out JsonElement fullNameElement) 
            ? fullNameElement.GetString() 
            : string.Empty;

        // Safely retrieve the "courseCredits" property
        string courseCredits = courseElement.TryGetProperty("courseCredits", out JsonElement courseCreditsElement) 
            ? courseCreditsElement.GetString() 
            : string.Empty;

        // Safely retrieve the "courseDesc" property
        string courseDesc = courseElement.TryGetProperty("courseDesc", out JsonElement courseDescElement) 
            ? courseDescElement.GetString() 
            : string.Empty;

        // Safely retrieve the "courseDepartment" property
        string courseDepartment = courseElement.TryGetProperty("courseDepartment", out JsonElement courseDepartmentElement) 
            ? courseDepartmentElement.GetString() 
            : string.Empty;

        // Safely retrieve the "repeatStatus" property
        string repeatStatus = courseElement.TryGetProperty("repeatStatus", out JsonElement repeatStatusElement) 
            ? repeatStatusElement.GetString() 
            : string.Empty;

        // Safely retrieve the "prereqs" property
        string prereqs = courseElement.TryGetProperty("prereqs", out JsonElement prereqsElement) 
            ? prereqsElement.GetString() 
            : string.Empty;

        // Safely retrieve the "coreqs" property
        string coreqs = courseElement.TryGetProperty("coreqs", out JsonElement coreqsElement) 
            ? coreqsElement.GetString() 
            : string.Empty;

        // Safely retrieve the "restrictions" property
        string restrictions = courseElement.TryGetProperty("restrictions", out JsonElement restrictionsElement) 
            ? restrictionsElement.GetString() 
            : string.Empty;

        // Safely retrieve the "offered" property
        string offered = courseElement.TryGetProperty("offered", out JsonElement offeredElement) 
            ? offeredElement.GetString() 
            : string.Empty;

        // Safely retrieve the "completedPreReqs" property (Boolean)
        bool completedPreReqs = courseElement.TryGetProperty("completedPreReqs", out JsonElement completedPreReqsElement) 
            ? completedPreReqsElement.GetBoolean() 
            : false;

        // Safely retrieve the "completedCoReqs" property (Boolean)
        bool completedCoReqs = courseElement.TryGetProperty("completedCoReqs", out JsonElement completedCoReqsElement) 
            ? completedCoReqsElement.GetBoolean() 
            : false;

        bool insideOfferedTerm = courseElement.TryGetProperty("inOfferedTerm", out JsonElement insideOfferedTermElement) 
            ? insideOfferedTermElement.GetBoolean() 
            : false;

        // Now, you can create your Course object safely
        var course = new CourseModel
        (
            shortName: shortName,
            fullName: fullName,
            credits: courseCredits,
            description: courseDesc,
            department: courseDepartment,
            repeatStatus: repeatStatus,
            prerequisites: prereqs,
            corequisites: coreqs,
            restrictions: restrictions,
            offeredTerms: offered,
            completedPreReqs: completedPreReqs,
            completedCoreqs: completedCoReqs,
            inOfferedTerm: insideOfferedTerm,
            id: id
        );
        return course;

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
        int placedTermIndex = Convert.ToInt32(root.GetProperty("TermIndex").ToString());

        _logger.LogInformation("POST request received with message: {Message} for SendCourseUpdate", Message);

        CourseModel CourseUpdated = CreateCourseObject(courseIdElement);

        _logger.LogInformation($"Course {CourseUpdated.Id} received with term index {placedTermIndex}");
        int previousTermIndex = _scheduleModel.GetCourseTermIndex(CourseUpdated, true);
        if (previousTermIndex != -1) { // Course is being created
            _logger.LogInformation($"Removing course {CourseUpdated.ShortName} from term {previousTermIndex}");
            _scheduleModel.RemoveCourseFromTerm(CourseUpdated, previousTermIndex);
        }
        if (placedTermIndex != -1) {//Course is being deleted
            _logger.LogInformation($"Adding course {CourseUpdated.ShortName} to term {placedTermIndex}");
            _scheduleModel.AddCourseToTerm(CourseUpdated, placedTermIndex);
        }

        HashSet<CourseModel> coursesNeedUpdating = new HashSet<CourseModel>();
        Dictionary<string, bool> previousCoursePreReqsStatus = new Dictionary<string, bool>();
        Dictionary<string, bool> previousCourseCoReqsStatus = new Dictionary<string, bool>();
        Dictionary<string, bool> previousCourseOfferedStatus = new Dictionary<string, bool>();
        foreach (CourseModel course in _scheduleModel.Terms.SelectMany(term => term.Courses))
        {
            int courseTermIndex = _scheduleModel.GetCourseTermIndex(course);
            _logger.LogInformation($"Checking course {course.ShortName} in term {courseTermIndex}");

            bool isAddedBefore = placedTermIndex <= courseTermIndex;
            bool isRemovedBefore = previousTermIndex < courseTermIndex;
            bool isSameTerm = previousTermIndex == courseTermIndex || placedTermIndex == courseTermIndex;
            bool isSameCourse = course.Id == CourseUpdated.Id;

            _logger.LogInformation($"isSameCourse: {isSameCourse}");
            if (isSameCourse) {
                previousCourseOfferedStatus.Add(course.Id, course.InOfferedTerm);
                OfferedTermHandler offeredTermHandler = new OfferedTermHandler(course, _requisitesHandler, _scheduleModel);
                _logger.LogInformation($"isOfferedTermSatisfied: {offeredTermHandler.IsOfferedTermSatisfied()}");
                course.InOfferedTerm = offeredTermHandler.IsOfferedTermSatisfied();
                if (offeredTermHandler.IsOfferedTermSatisfied() != previousCourseOfferedStatus.GetValueOrDefault(course.Id, !course.InOfferedTerm))
                {
                    _logger.LogInformation($"Course needs updating {course.ShortName}");
                    coursesNeedUpdating.Add(course);
                }
            }

            if (isSameCourse || isSameTerm) {
                previousCourseCoReqsStatus.Add(course.Id, course.CompletedCoreqs);
                CoreqHandler coreqHandler = new CoreqHandler(course, _requisitesHandler, _scheduleModel);
                course.CompletedCoreqs = coreqHandler.IsCoreqSatisfied();
                if (course.CompletedCoreqs != previousCourseCoReqsStatus.GetValueOrDefault(course.Id, !course.CompletedCoreqs))
                {
                    coursesNeedUpdating.Add(course);
                }
            }

            if (isSameCourse || (isAddedBefore && !course.CompletedPreReqs) || (isRemovedBefore && course.CompletedPreReqs))
            {
                previousCoursePreReqsStatus.Add(course.Id, course.CompletedPreReqs);

                PrereqTree tree = new PrereqTree(course, _scheduleModel, _loggerPrereqTree, _requisitesHandler);
                tree.BuildTree();
                course.CompletedPreReqs = tree.IsPrereqSatisfied(tree.getRoot());
                if (course.CompletedPreReqs != previousCoursePreReqsStatus.GetValueOrDefault(course.Id, !course.CompletedPreReqs))
                {
                    coursesNeedUpdating.Add(course);
                }
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

            _logger.LogInformation($"Term {termName} received with id {termId} and credits {termCredits}");
            foreach (JsonElement courseElement in termElement.GetProperty("courses").EnumerateArray())
            {
                CourseModel course = CreateCourseObject(courseElement);
                courses.Add(course);
            }

            terms.Add(new TermModel(termId, termName, termCredits, courses));
        }

        _scheduleModel.SetTerms(terms);

        return Ok(new
        {
            response = "Schedule initialized successfully.",
            receivedSchedule = terms
        });
    }
}
