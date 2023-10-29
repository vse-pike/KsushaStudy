using SSO.Services;

namespace SSO.Middlewares;

public class RegistryMiddleware
{
    public readonly RequestDelegate _next;

    public RegistryMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext httpContext)
    {
        try
        {
            await _next(httpContext);
        }
        catch (Exception exception)
        {
            Console.WriteLine(exception.Message);

            var error = new Error
            (
                "UnexpectedError",
                "Unexpected error during operation"
            );

            httpContext.Response.StatusCode = 400;

            await httpContext.Response.WriteAsJsonAsync(error);
        }
    }
}