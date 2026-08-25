using System.Collections.Generic;

namespace Jhoose.Security.Features.ImportExport.Models;
public record ExportOptions
{
    public List<string> Options { get; set; } = [];

    public bool ExportCsp => Options.Contains("csp");
    public bool ExportHeaders => Options.Contains("headers");
    public bool ExportSettings => Options.Contains("settings");
    public bool ExportPermissions => Options.Contains("permissions");
    public bool ExportIpRestrictions => Options.Contains("ipRestrictions");
    public bool ExportCspPageOverrides => Options.Contains("cspPageOverrides");
    public bool ExportPermissionsPageOverrides => Options.Contains("permissionsPageOverrides");
}