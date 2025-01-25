using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;


[ApiController]
[Route("api/[controller]")]
public class ExampleController : ControllerBase
{
    private readonly ILogger<ExampleController> _logger;

    public ExampleController(ILogger<ExampleController> logger)
    {
        _logger = logger;
    }
    // GET: api/example
    [HttpGet]
    public IActionResult Get()
    {
        _logger.LogInformation("GET request received at api/example.");
        return Ok("Hello from the ExampleController!");
    }

    // GET: api/example/greet
    [HttpGet("greet")]
    public IActionResult Greet()
    {
        _logger.LogInformation("GET request received at api/example/greet.");
        return Ok("Greetings from the ExampleController!");
    }

    // POST: api/example
    [HttpPost]
    public IActionResult Post([FromBody] string message)
    {
        _logger.LogInformation("POST request received with message: {Message}", message);
        return Ok($"You sent: {message}");
    }
}
