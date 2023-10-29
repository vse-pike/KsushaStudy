namespace SSO.Services;

public struct Result
{
    public bool IsSucceeded { get; set; }
    public bool IsConflict { get; set; }
    public bool IsBadRequest { get; set; }

    private List<Error> _errors;

    private IResponse _response;

    public Result()
    {
        IsSucceeded = false;
    }

    public static Result Success()
    {
        return new Result
        {
            IsSucceeded = true
        };
    }

    public static Result SuccessWithBody(IResponse response)
    {
        return new Result
        {
            IsSucceeded = true,
            _response = response
        };
    }

    public static Result BadRequest(params Error[]? errors)
    {
        return new Result { IsBadRequest = true, _errors = errors?.ToList() ?? new List<Error>() };
    }

    public static Result Conflict(params Error[]? errors)
    {
        return new Result { IsConflict = true, _errors = errors?.ToList() ?? new List<Error>() };
    }

    public IEnumerable<Error> Errors()
    {
        return _errors.ToArray();
    }
    
    public IResponse Response()
    {
        return _response;
    }
}