using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Log4Net.AspNetCore;
//dotnet run
var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders(); // Remove default logging providers
builder.Logging.AddLog4Net("log4net.config"); // Add log4net using the configuration file

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<FileReader>();
builder.Services.AddSingleton<ScheduleModel>();
builder.Services.AddSingleton<RequisitesHandler>();

// Enable CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") // Frontend's origin
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Use the CORS policy
app.UseCors("AllowSpecificOrigin");

app.UseAuthorization();

app.MapControllers();

app.Run();

var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("Application has started.");
logger.LogError("This is a test error log.");
