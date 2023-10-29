using SSO.Controllers.Models;
using SSO.Services;

namespace SSO.Bl.Interfaces;

public interface IUserBl
{
    public Task<Result> CreateUser(RegistryModel model);
    public Task<Result> GetAccessToken(LoginModel model);
}