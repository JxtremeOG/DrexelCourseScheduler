using System.Text.RegularExpressions;

public class CourseModel
{
    private string _shortName;
    private string _fullName;
    private double _credits;
    private string _description;
    private string _department;
    private string _repeatStatus;
    private string _prerequisites;
    private string _corequisites;
    private string _restrictions;
    private string _offeredTerms;
    private RequisitesHandler _requisitesHandler;

    public CourseModel(string shortName, string fullName, 
    double credits, string description, 
    string department, string repeatStatus, 
    string prerequisites, string corequisites, 
    string restrictions, string offeredTerms,
    RequisitesHandler requisitesHandler)
    {
        _shortName = shortName;
        _fullName = fullName;
        _credits = credits;
        _description = description;
        _department = department;
        _repeatStatus = repeatStatus;
        _prerequisites = prerequisites;
        _corequisites = corequisites;
        _restrictions = restrictions;
        _offeredTerms = offeredTerms;
    }

    public string GetPrerequisites()
    {
        return _requisitesHandler.CleanRequisites(_prerequisites);
    }
}