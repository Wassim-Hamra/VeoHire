using dotnet9.Interfaces;
using dotnet9.Services;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// OpenAPI for API documentation
builder.Services.AddOpenApi();

// CORS
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("cors", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });

    /*opt.AddPolicy("cors2", policy =>
    {
        policy.WithOrigins("http://localhost:4173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });*/
});

// Register scoped services
builder.Services.AddScoped<IEmailService, SmtpEmailService>();
//builder.Services.AddScoped<IUserRepo, UserRepo>();


// In Program.cs, before app.UseRouting()
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            // Use the client IP as the partition key
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            partition => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 50, // Allow 100 requests...
                Window = TimeSpan.FromMinutes(1), // ...per minute.
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));
    options.RejectionStatusCode = 429;
});




// Add controllers
builder.Services.AddControllers();

// Register SignalR
//builder.Services.AddSignalR();

//servcices before build
builder.Services.AddHttpClient();
//servcicesbefore build

var app = builder.Build();

// Use HTTPS Redirection
app.UseHttpsRedirection();

// Use Routing
app.UseRouting();

// **Use CORS after routing**
app.UseCors("cors");

// Map controllers
app.MapControllers();

app.UseRateLimiter();

// Map SignalR hub and require the CORS policy on it
//app.MapHub<ChatHub>("/chathub").RequireCors("cors");

// Swagger/OpenAPI in development
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "dotnet9");
    });
}

app.Run();