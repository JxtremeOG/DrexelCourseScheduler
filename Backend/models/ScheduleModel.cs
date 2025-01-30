using System.Reflection;

public class ScheduleModel {
    public List<TermModel> Terms;
    private ILogger<ScheduleModel> _logger;
    private FileReader _fileReader;
    private Dictionary<string, CourseModel> _courseInformation;
    public ScheduleModel(ILogger<ScheduleModel> logger, FileReader fileReader) {
        Terms = new List<TermModel>();
        _logger = logger;
        _fileReader = fileReader;
        _courseInformation = _fileReader.ReadCoursesJson("courseJsons/masterJsons.json");
    }

    public void AddCourseToTerm(CourseModel course, int termIndex) {
        Terms[termIndex].AddCourse(course);
    }
    public void RemoveCourseFromTerm(CourseModel course, int termIndex) {
        Terms[termIndex].RemoveCourse(course);
    }
    public int GetCourseTermIndex(CourseModel course, bool canNotFind = false) {
        string courseId = course.Id;
        for (int i = 0; i < Terms.Count; i++) {
            for (int j = 0; j < Terms[i].Courses.Count; j++) {
                if (Terms[i].Courses[j].Id == courseId) {
                    return i;
                }
            }
        }
        if (!canNotFind)
            _logger.LogError($"Course with shortName {course.ShortName} id {courseId} not found in any term.");
        return -1;
    }

    public Tuple<int, string> GetMaximumValidCourseTermIndex(string courseShortName, int pivotTermIndex) {
        for (int i = pivotTermIndex-1; i >= 0; i--) {
            for (int j = 0; j < Terms[i].Courses.Count; j++) {
                if (Terms[i].Courses[j].ShortName == courseShortName) {
                    return new Tuple<int, string>(i, Terms[i].Courses[j].Id); //Finds the max because we are looking from last term to first term (and starts at the pivot term)
                }
            }
        }
        _logger.LogInformation($"GetMaximumCourseTermIndex: Course with shortName {courseShortName} not found in any term.");
        return new Tuple<int, string>(-1, "");
    }

    public CourseModel GetCourseFromTerm(string courseShortName, int termIndex) {
        foreach (CourseModel course in Terms[termIndex].Courses) {
            if (course.ShortName == courseShortName) {
                return course; //If there are two it takes the first one this shouldn't effect any logic
            }
        }
        _logger.LogError($"GetCourseFromTerm: Course with shortName {courseShortName} not found in any term.");
        return null;
    }

    public CourseModel CreateCourseFromShortName(string shortName) {
        if (_courseInformation.ContainsKey(shortName)) {
            CourseModel course = _courseInformation[shortName];
            course.Id = GenerateCourseId();
            _logger.LogInformation($"Creating course with {course.Id} for {shortName}");
            return course;
        }
        _logger.LogError($"Course with short name {shortName} not found in course information.");
        return CreateCourseFromShortName("FAKE 001");
    }

    private string GenerateCourseId() {
        return $"courseTEMP-{DateTime.UtcNow.Ticks}-{Guid.NewGuid().ToString("N").Substring(0, 10)}";
    }
}