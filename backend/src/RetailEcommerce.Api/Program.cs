using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;
using Microsoft.OpenApi;
using RetailEcommerce.Api.Filters;
using RetailEcommerce.Api.Middleware;
using RetailEcommerce.Api.Services;
using RetailEcommerce.Application;
using RetailEcommerce.Application.Interfaces;
using RetailEcommerce.Infrastructure;
using RetailEcommerce.Infrastructure.Identity;
using RetailEcommerce.Infrastructure.Persistence;
using RetailEcommerce.Infrastructure.Persistence.Seed;

var builder = WebApplication.CreateBuilder(args);

// ----- MVC + validation + JSON -----
builder.Services.AddControllers(options =>
{
    options.Filters.Add<FluentValidationFilter>();
})
.AddJsonOptions(json =>
{
    json.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

// ----- Application + Infrastructure -----
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// ----- CORS for the Angular client -----
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                     ?? new[] { "http://localhost:4200" };
const string CorsPolicy = "AllowFrontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod());
});

// ----- Swagger with JWT bearer -----
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Retail E-commerce API",
        Version = "v1",
        Description = "Demo cửa hàng bán lẻ — Clean Architecture, EF Core, PostgreSQL, JWT."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập JWT (không cần tiền tố 'Bearer')."
    });
    c.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer")] = new List<string>()
    });
});

var app = builder.Build();

// ----- Migrate + seed on startup -----
await SeedDatabaseAsync(app);

// ----- Pipeline -----
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(CorsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

static async Task SeedDatabaseAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var sp = scope.ServiceProvider;
    var logger = sp.GetRequiredService<ILogger<Program>>();
    try
    {
        var db = sp.GetRequiredService<ApplicationDbContext>();
        var userManager = sp.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = sp.GetRequiredService<RoleManager<ApplicationRole>>();
        await DbSeeder.SeedAsync(db, userManager, roleManager, app.Configuration, logger);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Khởi tạo cơ sở dữ liệu thất bại. Kiểm tra ConnectionStrings:DefaultConnection và PostgreSQL.");
        throw;
    }
}

// Exposed for potential integration tests.
public partial class Program { }
