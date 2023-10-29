using System.ComponentModel.DataAnnotations;

namespace SSO.DAL.Models;

public class UserModel
{
    [Key]
    public string UserId { get; set; }
    public string Name { get; set; }
    public string Login { get; set; }
    public string PasswordHash { get; set; }
    public string Role { get; set; }
    public TokenModel TokenModel { get; set; }
}