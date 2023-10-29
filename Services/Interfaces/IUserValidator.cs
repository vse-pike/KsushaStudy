using SSO.Controllers.Models;

namespace SSO.Services.Interfaces;

public interface IUserValidator
{
    Task<Result> Validate(RegistryModel model);
}