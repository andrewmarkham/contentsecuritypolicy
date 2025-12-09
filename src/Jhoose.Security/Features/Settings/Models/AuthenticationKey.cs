namespace Jhoose.Security.Features.Settings.Models;

public class AuthenticationKey
{
    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public bool Revoked { get; set; } = false;
}