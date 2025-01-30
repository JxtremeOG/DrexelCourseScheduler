using Microsoft.AspNetCore.Components.Endpoints;

public class PrereqNode {
    public int TermIndex { get; set; }
    public List<PrereqNode> Children { get; set; }
    public PrereqNode(int termIndex) {
        TermIndex = termIndex;
        Children = new List<PrereqNode>();
    }

    public void AddChild(PrereqNode child) {
        Children.Add(child);
    }
    public virtual int GetTermIndex() {
        return TermIndex;
    }
}

public class PrereqCourseNode : PrereqNode {
    public CourseModel Course { get; set; }
    public PrereqCourseNode(CourseModel course, int termIndex) : base(termIndex) {
        Course = course;
    }
    public override int GetTermIndex() {
        return TermIndex;
    }

}

public class PrereqOperatorNode : PrereqNode {
    public string Operator { get; set; }
    public PrereqOperatorNode(string operatorName, int termIndex = -1) : base(termIndex) {
        Operator = operatorName;
    }
    public override int GetTermIndex() {
        List<int> termIndices = new List<int>();
        if (Operator == "and") {
            foreach (PrereqNode child in Children) {
                termIndices.Add(child.GetTermIndex());
            }
            return termIndices.Min() == -1 ? -1 : termIndices.Max();
        }
        if (Operator == "or") {
            foreach (PrereqNode child in Children) {
                termIndices.Add(child.GetTermIndex());
            }
            if (termIndices.All(x => x == -1)) {
                return -1;
            }
            if (termIndices.Any(x => x == -1)) {
                return termIndices.Max();
            }
            return termIndices.Min();
        }
        throw new Exception("Invalid operator");
        return -1; //SHOULD NEVER HAPPEN
    }
}

public class PrereqTree {
    private PrereqCourseNode _root;
    private ScheduleModel _schedule;
    private Logger<PrereqTree> _logger;
    private RequisitesHandler _requisitesHandler;
    public PrereqTree(CourseModel courseRoot, ScheduleModel schedule, Logger<PrereqTree> logger, RequisitesHandler requisitesHandler) {
        _root = new PrereqCourseNode(courseRoot, schedule.GetCourseTermIndex(courseRoot));
        _schedule = schedule;
        _logger = logger;
        _requisitesHandler = requisitesHandler;
    }

    public PrereqCourseNode getRoot() {
        return _root;
    }

    public void BuildTree() {
        _root.AddChild(ExtendTree(_requisitesHandler.SplitRequisites(_requisitesHandler.CleanRequisites(_root.Course.Prerequisites)), _root.TermIndex));
    }

    private PrereqNode ExtendTree(List<string> prereqList, int extendeeTermIndex) {
        if (prereqList.Count == 1 && prereqList[0].Length > 0) {
            PrereqCourseNode courseNode = null;
            if (prereqList[0].Contains("AP")) {
                CourseModel course = _schedule.CreateCourseFromShortName("FAKE 000");
                // _schedule.AddCourseToTerm(course, 0);
                courseNode = new PrereqCourseNode(course, -1);
            }
            else {
                // CourseModel course = _schedule.CreateCourseFromShortName(prereqList[0]);
                // courseNode = new PrereqCourseNode(course, _schedule.GetCourseTermIndex(course));
                Tuple<int, string> courseValues = _schedule.GetMaximumValidCourseTermIndex(prereqList[0], extendeeTermIndex);
                int termIndex = courseValues.Item1;
                string termId = courseValues.Item2; //Could be used for faster tree lookups would be complex to implement
                CourseModel course;
                if (termIndex != -1)
                    course = _schedule.GetCourseFromTerm(prereqList[0], termIndex);
                else
                    course = _schedule.CreateCourseFromShortName(prereqList[0]);
                courseNode = new PrereqCourseNode(course, termIndex);
            }

            if (courseNode == null) {
                _logger.LogError($"Course with short name {prereqList[0]} not found in course information.");
                return null;
            }

            string cleanedPrereq = _requisitesHandler.CleanRequisites(courseNode.Course.Prerequisites);
            if (!cleanedPrereq.Equals("")) {
                courseNode.AddChild(ExtendTree(_requisitesHandler.SplitRequisites(cleanedPrereq), courseNode.TermIndex));
            }
            return courseNode;
        } else if (prereqList[0].Length == 0) {
            _logger.LogError("Empty prerequisite list");
            return null;
        }
        else {
            PrereqOperatorNode operatorNode = new PrereqOperatorNode(prereqList[1]);
            PrereqNode leftChild = ExtendTree(_requisitesHandler.SplitRequisites(prereqList[0]), extendeeTermIndex);
            PrereqNode rightChild = ExtendTree(_requisitesHandler.SplitRequisites(prereqList[2]), extendeeTermIndex);

            operatorNode.AddChild(leftChild);
            operatorNode.AddChild(rightChild);
            return operatorNode;
        }

    }

    public bool IsPrereqSatisfied(PrereqNode node) {
        if (node is PrereqCourseNode) {
            if (node.TermIndex == -1) {
                _logger.LogError("Course not found in schedule");
                return false;
            }
            if (node.Children.Count == 0 || node.Children[0] == null) 
                return true;
            if (node.TermIndex == 0) {
                _logger.LogInformation($"Course was taken before the start of the schedule");
                return true;
            }
            int childTermIndex = node.Children[0].GetTermIndex();
            if (childTermIndex == 0) {
                _logger.LogInformation($"Course was taken before the start of the schedule");
                return true;
            }
            if (childTermIndex != -1 && node.TermIndex > childTermIndex)
                return IsPrereqSatisfied(node.Children[0]);
            _logger.LogError("Prerequisite not satisfied");
            return false;
        }
        if (node is PrereqOperatorNode operatorNode) {
            if (operatorNode.Operator == "or")
                return IsPrereqSatisfied(operatorNode.Children[0]) || IsPrereqSatisfied(operatorNode.Children[1]);
            if (operatorNode.Operator == "and")
                return IsPrereqSatisfied(operatorNode.Children[0]) && IsPrereqSatisfied(operatorNode.Children[1]);
        }
        _logger.LogError("Invalid node type");
        return false;
    }

}