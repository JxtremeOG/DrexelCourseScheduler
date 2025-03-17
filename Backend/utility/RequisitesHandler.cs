using System.Text.RegularExpressions;

public class RequisitesHandler
{
    private readonly Regex _requisitesRegex = new Regex(@"\s+\[.*?\]+?");
    private readonly Regex _commaRegex = new Regex(@"(,\s+\)+)+");
    private readonly Regex _spacesRegex = new Regex(@"\s+");

    private readonly Regex _splitRegex = new Regex(@"^(\(.*?\)|[A-Z0-9]+\s[0-9P]+)\s+(and|or)\s+(.*)$");
    private readonly Regex _parenthesesRegex = new Regex(@"^\([^()]*\)$");

    public string CleanRequisites(string requisites)
    {
        if (requisites is null)
        {
            return "";
        }
        //(?<Open>[(]*)\s*(?<Course>[A-Za-z]+\s*[0-9]+)+\s*(?<MinGrade>\[[^\]]+\])\s*(?<Operator>\bor|and|OR|AND\b)*\s*(?<Close>[)]*)
        requisites = requisites.Replace("(Can be taken Concurrently)", "");
        requisites = _requisitesRegex.Replace(requisites, "");
        requisites = _commaRegex.Replace(requisites, ")");
        requisites = requisites.Replace(",", " or ");
        requisites = _spacesRegex.Replace(requisites, " ");
        requisites = requisites.Replace(" )", ")");
        return requisites.Trim();
    }

    public string RemoveSurroundingParentheses(string requisites)
    {
        if (requisites.Length > 0 && requisites[0] == '(' && requisites[requisites.Length - 1] == ')')
        {
            if (_parenthesesRegex.IsMatch(requisites))
                return requisites.Substring(1, requisites.Length - 2);
        }
        return requisites;
    }

    public List<string> SplitRequisites(string requisites)
    {
        List<string> splitRequisites = new List<string>();
        requisites = RemoveSurroundingParentheses(requisites);
        requisites = requisites.Trim();
        Match requisitesMatches = _splitRegex.Match(requisites);
        if (requisitesMatches.Captures.Count != 0)
        {
            string firstPart = requisitesMatches.Groups[1].Value.Trim();
            string operatorPart = requisitesMatches.Groups[2].Value.Trim();
            string secondPart = requisitesMatches.Groups[3].Value.Trim();

            firstPart = RemoveSurroundingParentheses(firstPart);
            secondPart = RemoveSurroundingParentheses(secondPart);
            splitRequisites.Add(firstPart);
            splitRequisites.Add(operatorPart);
            splitRequisites.Add(secondPart);
        }
        else
        {
            splitRequisites.Add(requisites);
        }
        return splitRequisites;
    }
}