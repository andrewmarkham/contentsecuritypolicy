using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Jhoose.Security.Features.Settings.Models;

public class CspSettings
{
    public CspSettings()
    {
        this.Mode = "off";
        this.PermissionMode = "off";
        this.ReportingMode = ReportingMode.None;
        this.SiteModes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        this.PermissionModesBySite = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
    }
    public string Mode { get; set; }
    public string PermissionMode { get; set; }
    public ReportingMode ReportingMode { get; set; }

    public Dictionary<string, string> SiteModes { get; set; }
    public Dictionary<string, string> PermissionModesBySite { get; set; }

    /// <summary>
    /// Used for the report-uri directive
    /// </summary>
    public string ReportingUrl { get; set; } = string.Empty;

    /// <summary>
    /// Used by the report-to directive
    /// </summary>
    public string ReportToUrl { get; set; } = string.Empty;

    /// <summary>
    /// Urls that will be triggered when the settings change
    /// </summary>
    public List<string>? WebhookUrls { get; set; } = [];

    public List<AuthenticationKey>? AuthenticationKeys { get; set; } = [];

    [JsonIgnore]
    public bool HasReporting => !string.IsNullOrEmpty(this.ReportingUrl) | !string.IsNullOrEmpty(this.ReportToUrl);

    [JsonIgnore]
    public bool IsEnabled => !this.Mode.Equals("off");

    [JsonIgnore]
    public bool IsPermissionsEnabled => !this.PermissionMode.Equals("off");
    
    [JsonIgnore]
    public string PolicyHeader => this.Mode.Equals("on", StringComparison.CurrentCultureIgnoreCase) ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only";

    [JsonIgnore]
    public string PermissionPolicyHeader => this.PermissionMode.Equals("on", StringComparison.CurrentCultureIgnoreCase) ? "Permissions-Policy" : "Permissions-Policy-Report-Only";

    public string GetModeForSite(string siteId)
    {
        var key = NormalizeSiteId(siteId);
        if (this.SiteModes != null && this.SiteModes.TryGetValue(key, out var mode))
        {
            return mode;
        }
        return this.Mode;
    }

    public string GetPermissionModeForSite(string siteId)
    {
        var key = NormalizeSiteId(siteId);
        if (this.PermissionModesBySite != null && this.PermissionModesBySite.TryGetValue(key, out var mode))
        {
            return mode;
        }
        return this.PermissionMode;
    }

    public bool IsEnabledForSite(string siteId) => !GetModeForSite(siteId).Equals("off", StringComparison.CurrentCultureIgnoreCase);

    public bool IsPermissionsEnabledForSite(string siteId) => !GetPermissionModeForSite(siteId).Equals("off", StringComparison.CurrentCultureIgnoreCase);

    private static string NormalizeSiteId(string siteId)
    {
        return string.IsNullOrWhiteSpace(siteId) ? "*" : siteId.Trim();
    }

}
