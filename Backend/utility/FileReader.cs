using System.Text.Json;

public class FileReader {
    private ILogger<FileReader> _logger;
    private RequisitesHandler _requisitesHandler;
    public FileReader(ILogger<FileReader> logger, RequisitesHandler requisitesHandler) {
        _logger = logger;
        _requisitesHandler = requisitesHandler;
    }

    public Dictionary<string, CourseModel> ReadCoursesJson(string jsonFilePath) {
        try
        {
            // Read the JSON file content
            string jsonString = File.ReadAllText(jsonFilePath);

            // Deserialize JSON into Dictionary<string, CourseModel>
            // Dictionary<string, CourseModel> coursesDict = JsonSerializer.Deserialize<Dictionary<string, CourseModel>>(jsonString);
            Dictionary<string, CourseModel> coursesDict = new Dictionary<string, CourseModel>();
            using (JsonDocument doc = JsonDocument.Parse(jsonString))
            {
                var root = doc.RootElement; // Get the root element

                foreach (JsonProperty property in root.EnumerateObject())
                {
                    string courseKey = property.Name; // The key in the dictionary
                    JsonElement courseElement = property.Value;

                    // Manually create the CourseModel object
                    CourseModel course = new CourseModel(
                        shortName: courseElement.GetProperty("shortName").GetString(),
                        fullName: courseElement.GetProperty("fullName").GetString(),
                        credits: courseElement.GetProperty("courseCredits").GetString(),
                        description: courseElement.GetProperty("courseDesc").GetString(),
                        department: courseElement.GetProperty("courseDepartment").GetString(),
                        repeatStatus: courseElement.GetProperty("repeatStatus").GetString(),
                        prerequisites: courseElement.GetProperty("prereqs").GetString(),
                        corequisites: courseElement.GetProperty("coreqs").GetString(),
                        restrictions: courseElement.GetProperty("restrictions").GetString(),
                        offeredTerms: courseElement.GetProperty("offered").GetString(),
                        completedPreReqs: false,
                        completedCoreqs: false,
                        inOfferedTerm: false
                    );

                    coursesDict[courseKey] = course;
                }
            }

            // Verify deserialization
            if (coursesDict != null)
            {
                // Create a new dictionary with shortName as key for quick access
                Dictionary<string, CourseModel> courseDictionary = new Dictionary<string, CourseModel>();

                foreach (var kvp in coursesDict)
                {
                    // Ensure that shortName is not null or empty
                    if (!string.IsNullOrEmpty(kvp.Value.ShortName))
                    {
                        // Add to the new dictionary with shortName as the key
                        courseDictionary[kvp.Value.ShortName] = kvp.Value;
                    }
                    else
                    {
                        _logger.LogError($"Course shortName is null or empty {kvp.Value}.");
                    }
                }
                _logger.LogInformation($"Successfully read and deserialized the JSON file '{jsonFilePath}'.");
                return courseDictionary;
            }
            else
            {
                _logger.LogError("Failed to deserialize the JSON file.");
            }
        }
        catch (FileNotFoundException)
        {
            _logger.LogError($"The file at path '{jsonFilePath}' was not found.");
        }
        catch (JsonException ex)
        {
            _logger.LogError($"JSON deserialization error: {ex.Message}");
        }
        catch (Exception ex)
        {
            _logger.LogError($"An unexpected error occurred: {ex.Message}");
        }
        return null;
    }
}