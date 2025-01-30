using Xunit;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authentication;

namespace DrexelCourseScheduler.Tests;
public class UnitTest1
{
    private readonly RequisitesHandler _requisitesHandler;
    private readonly ScheduleModel _scheduleModel;
    private readonly FileReader _fileReader;
    private readonly Logger<PrereqTree> _logger;
    private readonly LoggerFactory _loggerFactory;
    public UnitTest1()
    {
        _requisitesHandler = new RequisitesHandler();
        _loggerFactory = new LoggerFactory();
        _fileReader = new FileReader(new Logger<FileReader>(_loggerFactory), _requisitesHandler);
        _scheduleModel = new ScheduleModel(new Logger<ScheduleModel>(_loggerFactory), _fileReader);
    }

    [Theory]
    [InlineData("", 
    "")]
    [InlineData("ACCT 321 [Min Grade C]", 
    "ACCT 321")]
    [InlineData("PBHL 210 [Min Grade C] or STAT 201 [Min Grade C] or MATH 310 [Min Grade C] or PBHL 301 [Min Grade C] or HSCI 345 [Min Grade C]",
    "PBHL 210 or STAT 201 or MATH 310 or PBHL 301 or HSCI 345")]
    [InlineData("ENGR 220 [Min Grade D] or MATE 220 [Min Grade D]",
    "ENGR 220 or MATE 220")]
    [InlineData("(CS 270 [Min Grade C] or ECE 200 [Min Grade D]) and (CS 172 [Min Grade C] or ECEC 201 [Min Grade D] or ECE 105 [Min Grade D])",
    "(CS 270 or ECE 200) and (CS 172 or ECEC 201 or ECE 105)")]
    [InlineData("((ARCH 221 [Min Grade C-] and ARCH 251 [Min Grade C-]) or ARCH 170 [Min Grade C-] or INTR 351 [Min Grade C-], ) and ARCH 281 [Min Grade C] and (ARCH 224 [Min Grade C] or INTR 341 [Min Grade C-])",
     "((ARCH 221 and ARCH 251) or ARCH 170 or INTR 351) and ARCH 281 and (ARCH 224 or INTR 341)")]
    [InlineData("CS 345 [Min Grade C], GMAP 345 [Min Grade D] (Can be taken Concurrently)",
    "CS 345 or GMAP 345")]
    [InlineData("CS 260 [Min Grade C] and (MATH 201 [Min Grade C] or ENGR 231 [Min Grade D]) and (MATH 221 [Min Grade C] or MATH 222 [Min Grade C]) and (MATH 311 [Min Grade C] or MATH 410 [Min Grade C] or ECE 361 [Min Grade D])",
    "CS 260 and (MATH 201 or ENGR 231) and (MATH 221 or MATH 222) and (MATH 311 or MATH 410 or ECE 361)")]

     //CS 345 [Min Grade C], GMAP 345 [Min Grade D] (Can be taken Concurrently)
    public void TestCleanRequisites(string input, string expected)
    {
        string result = _requisitesHandler.CleanRequisites(input);
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData("CS 171:1","true")]
    [InlineData("CS 172:1","false")]
    [InlineData("CS 172:2,CS 171:2","false")]
    [InlineData("CS 172:2,CS 171:1","true")]
    [InlineData("CS 260:4,CS 265:3,CS 172:2,CS 171:1","true")]
    [InlineData("CS 260:4,CS 265:3,CS 172:3,CS 171:1","false")]
    [InlineData("CS 277:6,CS 260:4,CS 270:3,MATH 221:4,CS 265:3,CS 172:2,CS 171:1","true")]
    [InlineData("CS 277:6,CS 260:4,CS 270:3,MATH 221:3,CS 265:3,CS 172:3,CS 171:1","false")]
    [InlineData("CS 383:8,CS 260:4,CS 270:3,MATH 221:4,CS 265:3,CS 172:2,CS 171:1,ENGR 231:4,MATH 122:3,MATH 121:0,MATH 311:5","true")]
    [InlineData("CS 383:8,CS 260:4,CS 270:3,MATH 221:4,CS 265:4,CS 172:2,CS 171:1,ENGR 231:4,MATH 122:3,MATH 121:2,MATH 311:5","false")]
    [InlineData("CS 455:6","false")] //HAS NON EXISTENT COURSE PRERECS
    [InlineData("CS 172:5,CS 171:8,CS 171:3,CS 171:5,CS 171:9,CS 172:12,CS 171:15","true")]
    [InlineData("CS 265:4,CS 171:1,CS 172:2,CS 171:3","true")]
    //CS 260 and (MATH 201 or ENGR 231) and (MATH 221 or MATH 222) and (MATH 311 or MATH 410 or ECE 361)

    public void TestPrereqTree(string input, string expected) {
        for (int i = 0; i < 20; i++) {
            _scheduleModel.Terms.Add(new TermModel($"term-{DateTime.Now.Ticks}-{Guid.NewGuid().ToString("N").Substring(0, 5)}", "Test", 0, new List<CourseModel>()));
        }
        List<string> splitInput = input.Split(",").ToList();
        splitInput.ForEach(x => {
            List<string> courseSplit = x.Split(":").ToList();
            CourseModel course = _scheduleModel.CreateCourseFromShortName(courseSplit[0]);
            _scheduleModel.AddCourseToTerm(course, Convert.ToInt32(courseSplit[1]));
        });
        PrereqTree tree = new PrereqTree(_scheduleModel.CreateCourseFromShortName(splitInput[0].Split(":")[0]), _scheduleModel, new Logger<PrereqTree>(_loggerFactory), _requisitesHandler);
        tree.BuildTree();
        string result = tree.IsPrereqSatisfied(tree.getRoot()).ToString().ToLower();
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData("CS 171", "CS 171")]
    public void TestCreateCrouseFromShortName(string input, string expected) {
        CourseModel result = _scheduleModel.CreateCourseFromShortName(input);
        result.ShortName.Should().Be(expected);
    }

    [Theory]
    [InlineData("CS 171", "CS 171")]
    [InlineData("(CS 260 and CS 265 and CS 270)", "CS 260 and CS 265 and CS 270")]
    public void TestRemoveSurroundingParentheses(string input, string expected) {
        string result = _requisitesHandler.RemoveSurroundingParentheses(input);
        result.Should().Be(expected);
    }
}