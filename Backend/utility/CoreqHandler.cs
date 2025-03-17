public class CoreqHandler {
    public CourseModel Course { get; set; }
    public List<string> coreqs { get; set; } = new List<string>();
    private RequisitesHandler _requisitesHandler;

    private ScheduleModel _schedule;
    public CoreqHandler(CourseModel course, RequisitesHandler requisitesHandler, ScheduleModel schedule) {
        Course = course;
        _requisitesHandler = requisitesHandler;
        _schedule = schedule;
        coreqs = _requisitesHandler.SplitRequisites(_requisitesHandler.CleanRequisites(course.Corequisites));
    }

    public bool IsCoreqSatisfied() {
        int courseTermIndex = _schedule.GetCourseTermIndex(Course);
        if (courseTermIndex == 0 || coreqs.Count == 0 || coreqs[0].Trim().Equals(string.Empty)) return true;
        foreach (string coreq in coreqs) {
            if (_schedule.GetCourseFromTerm(coreq, courseTermIndex) is null) {
                return false;
            }
        }
        return true;
    }
}