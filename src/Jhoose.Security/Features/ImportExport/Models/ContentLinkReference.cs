namespace Jhoose.Security.Features.ImportExport.Models;

/// <summary>
/// Maps a page-level policy's <c>ContentLink</c> (the local environment's numeric ContentReference id
/// at export time) to the content's stable <c>ContentGuid</c>, so the override can be re-resolved to the
/// correct content when imported into a different environment.
/// </summary>
public record ContentLinkReference(string ContentLink, string ContentGuid, string? Name);
