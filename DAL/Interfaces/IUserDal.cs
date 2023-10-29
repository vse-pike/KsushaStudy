using SSO.DAL.Models;

namespace SSO.DAL.Interfaces;

public interface IUserDal
{
    public Task<UserModel?> FindByEmail(string email);
    public Task Add(UserModel userModel);

    public Task<TokenModel?> GetTokenByUserId(string userId);

    public Task AddToken(TokenModel tokenModel);

    public Task UpdateToken(TokenModel tokenModel);

}