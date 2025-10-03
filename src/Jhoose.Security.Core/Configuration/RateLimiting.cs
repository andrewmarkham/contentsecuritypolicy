namespace Jhoose.Security.Core.Configuration;

public class RateLimiting
{
    public bool Enabled { get; set; } = false;

    public int PermitLimit { get; set; } = 100;
    public int QueueLimit { get; set; } = 100;
    public int WindowSeconds { get; set; } = 60;
}