public class OfferedTermHandler{
    public CourseModel Course { get; set; }
    private RequisitesHandler _requisitesHandler;
    private ScheduleModel _schedule;
    public OfferedTermHandler(CourseModel course, RequisitesHandler requisitesHandler, ScheduleModel schedule){
        Course = course;
        _requisitesHandler = requisitesHandler;
        _schedule = schedule;
    }

    public bool IsOfferedTermSatisfied(){
        int courseTermIndex = _schedule.GetCourseTermIndex(Course);
        if(courseTermIndex == 0 || Course.OfferedTerms.ToLower().Contains(_schedule.TermNames[courseTermIndex].ToLower())){
            return true;
        }
        return false;
    }
}