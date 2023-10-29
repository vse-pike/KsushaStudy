using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SSO.DAL.Models;

public class TokenModel
{
    [Key]
    public string UserId { get; set; }
    public string Token { get; set; }
    public DateTime ExpirationDateTime { get; set; }
    public UserModel UserModel { get; set; }
}