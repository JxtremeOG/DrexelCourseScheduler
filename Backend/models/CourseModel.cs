using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

public class CourseModel
{
    public string Id { get; set; }
    public string FullName { get; set; }
    public string Credits { get; set; }
    public string Department { get; set; }
    public string Description { get; set; }
    public string OfferedTerms { get; set; }
    public string Prerequisites { get; set; }
    public string Corequisites { get; set; }
    public string RepeatStatus { get; set; }
    public string Restrictions { get; set; }
    public string ShortName { get; set; }

    public bool CompletedPreReqs { get; set; }
    public bool CompletedCoreqs { get; set; }
    private RequisitesHandler _requisitesHandler;

    public CourseModel(string shortName, string fullName, 
    string credits, string description, 
    string department, string repeatStatus, 
    string prerequisites, string corequisites, 
    string restrictions, string offeredTerms,
    bool completedPreReqs, bool completedCoreqs,
    string id = null)
    {
        ShortName = shortName;
        FullName = fullName;
        Credits = credits;
        Description = description;
        Department = department;
        RepeatStatus = repeatStatus;
        Prerequisites = prerequisites;
        Corequisites = corequisites;
        Restrictions = restrictions;
        OfferedTerms = offeredTerms;
        CompletedPreReqs = completedPreReqs;
        CompletedCoreqs = completedCoreqs;
        Id = id;
    }
    //GRABBING DIRECTLY FROM COURSEMODEL
    // public string GetPrerequisites()
    // {
    //     return _requisitesHandler.CleanRequisites(Prerequisites);
    // }
    // public string GetCorequisites()
    // {
    //     return _requisitesHandler.CleanRequisites(Corequisites);
    // }
}