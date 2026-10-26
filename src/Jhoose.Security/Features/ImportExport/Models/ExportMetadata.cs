using System;

namespace Jhoose.Security.Features.ImportExport.Models;

public record ExportMetadata
{
    /// <summary>The version of the export format written by this release.</summary>
    public const string CurrentVersion = "3.3.0";

    public string Version { get; init; } = CurrentVersion;
    public DateTime ExportedAt { get; init; } = DateTime.UtcNow;
}