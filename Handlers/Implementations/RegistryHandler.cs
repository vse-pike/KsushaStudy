using SSO.Bl.Interfaces;
using SSO.Handlers.Interfaces;
using SSO.Services;
using SSO.Controllers.Models;

namespace SSO.Handlers.Implementations;

public class RegistryHandler: IRegistryHandler
{
    private readonly IUserBl _userBl;

    public RegistryHandler(IUserBl userBl)
    {
        _userBl = userBl;
    }

    public async Task<Result> Registry(RegistryModel model)
    {
        var result = await _userBl.CreateUser(model);

        return result;
    }

}