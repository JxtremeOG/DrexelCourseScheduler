using System.Text.RegularExpressions;

public class RequisitesHandler
{
    private readonly Regex _requisitesRegex = new Regex(@"\s+\[.*?\]+?");
    private readonly Regex _commaRegex = new Regex(@"(,\s+\)+)+");
    private readonly Regex _spacesRegex = new Regex(@"\s+");

    public string CleanRequisites(string requisites)
    {
        //(?<Open>[(]*)\s*(?<Course>[A-Za-z]+\s*[0-9]+)+\s*(?<MinGrade>\[[^\]]+\])\s*(?<Operator>\bor|and|OR|AND\b)*\s*(?<Close>[)]*)
        requisites = requisites.Replace("(Can be taken Concurrently)", "");
        requisites = _requisitesRegex.Replace(requisites, "");
        requisites = _commaRegex.Replace(requisites, ")");
        requisites = requisites.Replace(",", " or ");
        requisites = _spacesRegex.Replace(requisites, " ");
        requisites = requisites.Replace(" )", ")");
        return requisites.Trim();
    }
}