using Microsoft.EntityFrameworkCore;
using SSO.DAL.Interfaces;
using SSO.DAL.Models;

namespace SSO.DAL.Implementations;

public class UserDal : IUserDal
{
    private readonly ApplicationContext _dbContext;

    public UserDal(ApplicationContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<UserModel?> FindByEmail(string email)
    {
        //Регистрозависимый поиск
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Login == email);
        return user;
    }

    public async Task Add(UserModel userModel)
    {
        await _dbContext.Users.AddAsync(userModel);
        //Сделать отдельным методом: SaveChangesAsync
        await _dbContext.SaveChangesAsync();
    }

    public async Task<TokenModel?> GetTokenByUserId(string userId)
    {
        var token = await _dbContext.Tokens.FirstOrDefaultAsync(t => t.UserId == userId);
        return token;
    }

    public async Task AddToken(TokenModel tokenModel)
    {
        await _dbContext.Tokens.AddAsync(tokenModel);
        await _dbContext.SaveChangesAsync();
    }

    public async Task UpdateToken(TokenModel tokenModel)
    {
        _dbContext.Entry(tokenModel).State = EntityState.Modified;
        await _dbContext.SaveChangesAsync();
    }
}