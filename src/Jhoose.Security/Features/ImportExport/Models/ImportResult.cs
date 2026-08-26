using System.Collections.Generic;

namespace Jhoose.Security.Features.ImportExport.Models;

/// <summary>
/// The outcome of applying an import, including any page-level overrides that were skipped
/// because their referenced content could not be resolved in this environment.
/// </summary>
public record ImportResult(List<string> Warnings);
