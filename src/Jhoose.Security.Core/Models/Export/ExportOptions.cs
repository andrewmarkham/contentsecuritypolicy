using System.Collections.Generic;

public record ExportOptions
{
    public List<string> Options { get; set; } = [];

    public bool ExportCsp => Options.Contains("csp");
    public bool ExportHeaders => Options.Contains("headers");
    public bool ExportSettings => Options.Contains("settings");
}