using System.Text.Json.Serialization;

public class TermModel{
    private FileReader _fileReader;
    public string Id { get; set; }
    public double Credits { get; set; }
    public string Name { get; set; }
    public string Year { get; set; }
    public List<CourseModel> Courses { get; set; }
    public TermModel(string id, string name, double credits, List<CourseModel> courses){
        Id = id;
        Name = name;
        Credits = credits;
        Courses = courses;
    }

    public void AddCourse(CourseModel course){
        Courses.Add(course);
    }
    public void RemoveCourse(CourseModel course){
        Courses = Courses.Where(c => c.Id != course.Id).ToList();
    }
}