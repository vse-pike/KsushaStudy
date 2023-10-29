using SSO.DAL.Interfaces;
using SSO.DAL.Models;
using SSO.Bl.Interfaces;
using SSO.Controllers.Models;
using SSO.Services;
using SSO.Services.Interfaces;

namespace SSO.BL;

public class UserBl : IUserBl
{
    private readonly IUserValidator _userValidator;
    private readonly IUserDal _userDal;

    public UserBl(IUserDal userDal, IUserValidator userValidator)
    {
        _userValidator = userValidator;
        _userDal = userDal;
    }

    public async Task<Result> CreateUser(RegistryModel model)
    {
        var validationResults = _userValidator.Validate(model).Result;

        if (validationResults.IsBadRequest)
        {
            return validationResults;
        }

        var userRecord = await _userDal.FindByEmail(model.Login);

        if (userRecord != null)
        {
            return Result.Conflict(
                new Error("UserAlreadyExist",
                    "The user with current email already exist"));
        }

        var passwordHash = GeneratePasswordHash(model.Password);

        var user = new UserModel
        {
            UserId = Guid.NewGuid().ToString(),
            Name = model.Name,
            Login = model.Login,
            PasswordHash = passwordHash,
            Role = model.Role
        };

        await _userDal.Add(user);

        return Result.Success();
    }

    public async Task<Result> GetAccessToken(LoginModel model)
    {
        var userRecord = await _userDal.FindByEmail(model.Login);
        if (userRecord == null)
        {
            return Result.BadRequest(
                new Error("InvalidCredentials",
                    "Invalid email or password"));
        }
        
        if (BCrypt.Net.BCrypt.Verify(model.Password, userRecord.PasswordHash))
        {
            var accessToken = Guid.NewGuid().ToString();
            var tokenExpirationDateTime = DateTime.UtcNow.AddMinutes(15);

            var existingToken = await _userDal.GetTokenByUserId(userRecord.UserId);
            if (existingToken == null)
            {
                var newToken = new TokenModel
                {
                    UserId = userRecord.UserId,
                    Token = accessToken,
                    ExpirationDateTime = tokenExpirationDateTime
                };

                await _userDal.AddToken(newToken);
            }
            else
            {
                existingToken.Token = accessToken;
                existingToken.ExpirationDateTime = tokenExpirationDateTime;
                await _userDal.UpdateToken(existingToken);
            }
            
            return Result.SuccessWithBody(
                new LoginResponse(accessToken));
        }

        return Result.BadRequest(
            new Error("InvalidCredentials",
                "Invalid email or password"));
    }

    private string? GeneratePasswordHash(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }
}