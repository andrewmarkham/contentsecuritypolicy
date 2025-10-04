using System;

namespace Jhoose.Security.Core.Models.Export;

public class JhoooseSecurityExportRecord
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }

    public string Status { get; set; } = string.Empty;
    public string SerializedExport { get; set; } = string.Empty;
}