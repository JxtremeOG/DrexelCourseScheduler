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
    public int GetCourseTermIndex(CourseModel course) {
        string courseId = course.Id;
        for (int i = 0; i < Terms.Count; i++) {
            for (int j = 0; j < Terms[i].Courses.Count; j++) {
                if (Terms[i].Courses[j].Id == courseId) {
                    return i;
                }
            }
        }
        _logger.LogError($"Course with shortName {course.ShortName} id {courseId} not found in any term.");
        return -1;
    }

    public CourseModel CreateCourseFromShortName(string shortName) {
        if (_courseInformation.ContainsKey(shortName)) {
            CourseModel course = _courseInformation[shortName];
            course.Id = GenerateCourseId();
            _logger.LogInformation($"Creating course with {course.Id} is null {course.Id is null}");
            return course;
        }
        _logger.LogError($"Course with short name {shortName} not found in course information.");
        return null;
    }

    private string GenerateCourseId() {
        return $"course-{DateTime.Now.Ticks}-{Guid.NewGuid().ToString("N").Substring(0, 5)}";
    }
}