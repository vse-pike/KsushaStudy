using System.ComponentModel.DataAnnotations;

namespace SSO.Controllers.Models;

public class RegistryModel
{
    [Required] public string Login { get; set; }

    [Required] public string Password { get; set; }

    [Required] public string Name { get; set; }

    [Required] public string Role { get; set; }
}