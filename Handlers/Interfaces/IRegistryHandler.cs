using SSO.Controllers.Models;
using SSO.Services;

namespace SSO.Handlers.Interfaces;

public interface IRegistryHandler
{
    public Task<Result> Registry(RegistryModel model);
}