namespace Jhoose.Security.Core.Models;

public class AuthenticationKey
{
    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public bool Revoked { get; set; } = false;
}