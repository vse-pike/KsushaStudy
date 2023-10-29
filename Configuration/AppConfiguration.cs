using Microsoft.EntityFrameworkCore;

namespace SSO.Configuration;

public static class AppConfiguration
{
    public static IApplicationBuilder ConfigureDateStorage<TDataContext>(
        this IApplicationBuilder app)
        where TDataContext : DbContext
    {
        _ = DatabaseMigrationWorker.Start<TDataContext>(app.ApplicationServices);

        return app;
    }
}