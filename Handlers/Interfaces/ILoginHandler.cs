using SSO.Controllers.Models;
using SSO.Services;

namespace SSO.Handlers.Interfaces;

public interface ILoginHandler
{
    public Task<Result> Login(LoginModel model);
}