using System;

namespace Jhoose.Security.Models.Export;

public record ExportMetadata
{
    public string Version { get; init; } = "1.0.0";
    public DateTime ExportedAt { get; init; } = DateTime.UtcNow;
}