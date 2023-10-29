using Microsoft.EntityFrameworkCore;

namespace SSO.Configuration;

public static class DatabaseMigrationWorker
{
    public static Task Start<TDataContext>(IServiceProvider serviceProvider) where TDataContext : DbContext
    {
        return Task.Run(
            () =>
            {
                while (true)
                {
                    try
                    {
                        using var scope = serviceProvider.CreateScope();
                        using var dataContext = scope.ServiceProvider.GetService<TDataContext>();

                        dataContext!.Database.Migrate();

                        break;
                    }
                    catch (Exception exception)
                    {
                        Console.WriteLine(exception.Message);
                    }
                }
            }
        );
    }
}