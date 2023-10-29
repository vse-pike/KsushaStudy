namespace SSO.Services;

public record LoginResponse(string AccessToken) : IResponse;