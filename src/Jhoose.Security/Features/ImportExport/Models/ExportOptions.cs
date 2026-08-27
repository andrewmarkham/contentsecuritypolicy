using System.Collections.Generic;

namespace Jhoose.Security.Features.ImportExport.Models;
public record ExportOptions
{
    public List<string> Options { get; set; } = [];

    public bool ExportCsp => Options.Contains("csp");
    public bool ExportHeaders => Options.Contains("headers");
    public bool ExportSettings => Options.Contains("settings");
    public bool ExportPermissions => Options.Contains("permissions");
}