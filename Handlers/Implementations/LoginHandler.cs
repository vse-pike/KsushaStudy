using SSO.Bl.Interfaces;
using SSO.Controllers.Models;
using SSO.Handlers.Interfaces;
using SSO.Services;

namespace SSO.Handlers.Implementations;

public class LoginHandler: ILoginHandler
{
    private readonly IUserBl _userBl;

    public LoginHandler(IUserBl userBl)
    {
        _userBl = userBl;
    }

    public async Task<Result> Login(LoginModel model)
    {
        var result = await _userBl.GetAccessToken(model);

        return result;
    }
}