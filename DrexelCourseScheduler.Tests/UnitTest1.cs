using Xunit;
using FluentAssertions;

namespace DrexelCourseScheduler.Tests;
public class UnitTest1
{
    private readonly RequisitesHandler _requisitesHandler;

    public UnitTest1()
    {
        _requisitesHandler = new RequisitesHandler();
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

     //CS 345 [Min Grade C], GMAP 345 [Min Grade D] (Can be taken Concurrently)
    public void TestCleanRequisites(string input, string expected)
    {
        string result = _requisitesHandler.CleanRequisites(input);
        Console.WriteLine(result);
        result.Should().Be(expected);
    }
}