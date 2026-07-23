using System.Text.Json;
using RetailEcommerce.Application.Common.Exceptions;

namespace RetailEcommerce.Api.Middleware;

/// <summary>Translates application exceptions into RFC7807 ProblemDetails responses.</summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleAsync(context, ex);
        }
    }

    private async Task HandleAsync(HttpContext context, Exception ex)
    {
        var (status, title) = ex switch
        {
            NotFoundException => (StatusCodes.Status404NotFound, "Không tìm thấy"),
            ConflictException => (StatusCodes.Status409Conflict, "Xung đột dữ liệu"),
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "Chưa xác thực"),
            _ => (StatusCodes.Status500InternalServerError, "Lỗi máy chủ")
        };

        // Print log for every exception, with request context and full stack trace.
        if (status == StatusCodes.Status500InternalServerError)
            _logger.LogError(ex, "Unhandled exception — {Method} {Path} => {StatusCode}",
                context.Request.Method, context.Request.Path, status);
        else
            _logger.LogWarning(ex, "{Title} — {Method} {Path} => {StatusCode}",
                title, context.Request.Method, context.Request.Path, status);

        var problem = new
        {
            type = $"https://httpstatuses.io/{status}",
            title,
            status,
            detail = status == StatusCodes.Status500InternalServerError
                ? "Đã xảy ra lỗi không mong muốn."
                : ex.Message,
            traceId = context.TraceIdentifier
        };

        context.Response.Clear();
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsync(JsonSerializer.Serialize(problem));
    }
}
