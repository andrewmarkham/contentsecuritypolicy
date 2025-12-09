using System;

namespace Jhoose.Security.Features.ImportExport.Models;

public record ExportMetadata
{
    public string Version { get; init; } = "1.0.0";
    public DateTime ExportedAt { get; init; } = DateTime.UtcNow;
}