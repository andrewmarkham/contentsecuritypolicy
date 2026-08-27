namespace Jhoose.Security;

public static class Constants
{
    public static class Authentication
    {
        public const string PolicyName = "jhoose:SecurityAdmin";
        public const string ApiKey = "X-API-Key";
    }

    public const string PermissionPolicyCacheKey = "jhoose-security-permission-policy";
    public const string ResponseHeadersCacheKey = "jhoose-security-response-headers";
    public const string PolicyCacheKey = "jhoose-content-security-policy";
    public const string SettingsCacheKey = "jhoose-content-security-settings";
    public const string IpRestrictionCacheKey = "jhoose-security-ip-restriction";
    public const string IpRestrictionIgnoredPathCacheKey = "jhoose-security-ip-restriction-ignored-path";
    public const string IgnoreHeadersCacheKey = "jhoose-security-ignore-headers";
}