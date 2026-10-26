namespace Jhoose.Security.Features.ImportExport.Models;

/// <summary>
/// The status shown for an uploaded import.
/// </summary>
public static class ImportStatus
{
    public const string Valid = "Valid";

    /// <summary>The file was read, but its contents no longer match the integrity hash written at export.</summary>
    public const string ModifiedSinceExport = "Modified since export";

    /// <summary>The file could not be read as a Jhoose Security export, so it can't be imported.</summary>
    public const string Invalid = "Invalid";

    /// <summary>The file was exported by a different version, so its integrity hash isn't expected to match.</summary>
    public static string FileVersion(string? version) => $"File Version {version}";
}
