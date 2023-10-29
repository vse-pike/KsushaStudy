using Microsoft.EntityFrameworkCore;
using SSO.BL;
using SSO.DAL.Implementations;
using SSO.DAL.Interfaces;
using SSO.Handlers.Implementations;
using SSO.Handlers.Interfaces;
using SSO.Bl.Interfaces;
using SSO.Configuration;
using SSO.Middlewares;
using SSO.DAL;
using SSO.Services.Implementations;
using SSO.Services.Interfaces;

namespace SSO;

public class Startup
{
    public IConfiguration Configuration { get; }

    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddDbContext<ApplicationContext>(options =>
            options.UseNpgsql(Configuration.GetConnectionString("DefaultConnection")));

        Console.WriteLine(Configuration.GetConnectionString("DefaultConnection"));

        services.AddScoped<IUserValidator, UserValidator>(_ => new UserValidator());
        services.AddScoped<IUserDal, UserDal>();
        services.AddScoped<IUserBl, UserBl>();
        services.AddScoped<IRegistryHandler, RegistryHandler>();
        services.AddScoped<ILoginHandler, LoginHandler>();

        services.AddControllers();
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        app.ConfigureDateStorage<ApplicationContext>();
        app.UseMiddleware<RegistryMiddleware>();
        app.UseRouting();
        app.UseEndpoints(endpoints =>
            endpoints.MapControllers());
    }
}