using System.Text.RegularExpressions;
using SSO.Controllers.Models;
using SSO.Services.Interfaces;

namespace SSO.Services.Implementations;

public class UserValidator : IUserValidator
{
    //CommonRules
    private const int MaxLength = 50;

    //PasswordRegex
    private const int RequiredLength = 8;
    private const string RequiredLettersPattern = @"[A-Z]";
    private const string RequiredSymbolsPattern = @"[!@#$%^&*()]";
    private const string RequiredDigitsPattern = @"\d";

    //EmailRegex
    private const string RequiredEmailPattern = @"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b";

    //RolePattern
    private static readonly string[] RequiredRole = { "client", "renter"};

    public Task<Result> Validate(RegistryModel model)
    {
        List<Error> errors = new List<Error>();

        if (model.Password.Length < RequiredLength)
        {
            errors.Add(new Error("PasswordTooShort", "The Password must contain at least 8 characters"));
        }

        if (!Regex.IsMatch(model.Password, RequiredLettersPattern))
        {
            errors.Add(new Error("PasswordMissingUppercase", "The Password must contain at least one capital letter"));
        }

        if (!Regex.IsMatch(model.Password, RequiredSymbolsPattern))
        {
            errors.Add(new Error("PasswordMissingSpecialCharacter",
                "The Password must contain at least one special character"));
        }

        if (!Regex.IsMatch(model.Password, RequiredDigitsPattern))
        {
            errors.Add(new Error("PasswordMissingDigit", "The Password must contain at least one digit"));
        }

        if (!Regex.IsMatch(model.Login, RequiredEmailPattern))
        {
            errors.Add(new Error("InvalidEmailFormat", "The Email format is not valid"));
        }

        if (!RequiredRole.Contains(model.Role))
        {
            errors.Add(new Error("InvalidRole", "The Role is not valid"));
        }

        if (model.Name.Length > MaxLength)
        {
            errors.Add(new Error("NameIsTooLong", "The Name is longer than 50 characters"));
        }

        if (model.Password.Length > MaxLength)
        {
            errors.Add(new Error("PasswordIsTooLong", "The Password is longer than 50 characters"));
        }

        if (model.Login.Length > MaxLength)
        {
            errors.Add(new Error("EmailIsTooLong", "The Email is longer than 50 characters"));
        }


        return Task.FromResult(errors.Count == 0
            ? Result.Success()
            : Result.BadRequest(errors.ToArray()));
    }
}