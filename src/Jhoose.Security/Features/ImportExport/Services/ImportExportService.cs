using System;
using System.Collections.Generic;
using System.Linq;

using EPiServer;
using EPiServer.Core;

using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.CSP.Models;

using Jhoose.Security.Features.ImportExport.Models;
using Jhoose.Security.Features.IpRestrictions.Models;
using Jhoose.Security.Features.Permissions.Models;

using Jhoose.Security.Features.ResponseHeaders.Models;

using Jhoose.Security.Features.Settings.Repository;
using Jhoose.Security.Helpers;

using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Features.ImportExport.Services;

public class ImportExportService(ISecurityRepository<CspPolicy> policyRepository,
                          ISecurityRepository<ResponseHeader> responseHeadersRepository,
                          ISecurityRepository<PermissionPolicy> permissionsRepository,
                          ISecurityRepository<IpRestrictionEntry> ipRestrictionRepository,
                          ISecurityRepository<IpRestrictionIgnoredPath> ipRestrictionIgnoredPathRepository,
                          ISecurityRepository<IpRestrictionIgnoreHeader> ipRestrictionIgnoreHeaderRepository,
                          ISettingsRepository settingsRepository,
                          IContentLoader contentLoader,
                          ILogger<ImportExportService> logger) : IImportExportService
{
    public ImportResult Import(JhoooseSecurityExport export)
    {
        if (export.Metadata.Version == "1.0.0")
        {
            logger.LogInformation("Importing Jhoose Security export version 1.0.0");

            // Handle settings changes
            if (export.CspSettings != null)
            {
                export.CspSettings.SiteModes.Add("*", export.CspSettings.Mode);
                export.CspSettings.PermissionModesBySite.Add("*", export.CspSettings.PermissionMode);
                export.CspSettings.AuthenticationKeys?.ForEach(key => key.Site = "*");
            }


        }

        var warnings = new List<string>();

        //handle settings import
        HandleSettingsImport(export);

        //handle policies import
        HandleCspImport(export, warnings);

        //handle permissions import
        HandlePermissionsImport(export, warnings);

        //handle response headers import
        HandleResponseHeadersImport(export);

        //handle ip restrictions import
        HandleIpRestrictionsImport(export);

        //handle ip restriction ignored paths import
        HandleIpRestrictionIgnoredPathsImport(export);

        //handle ip restriction ignore headers import
        HandleIpRestrictionIgnoreHeadersImport(export);

        return new ImportResult(warnings);
    }

    public bool IsValid(JhoooseSecurityExport export)
    {
        var receivedHash = export.IntegrityHash;
        export.IntegrityHash = string.Empty; // Remove hash for recalculation
        var computedHash = ObjectHasher.ComputeHash(export);

        return receivedHash == computedHash;
    }

    public JhoooseSecurityExport Export(bool includeCsp = true, bool includePermissions = true, bool includeHeaders = true, bool includeSettings = true, bool includeIpRestrictions = true, bool includeCspPageOverrides = true, bool includePermissionsPageOverrides = true)
    {
        List<CspPolicy>? cspPolicies = null;
        List<ContentLinkReference>? cspContentReferences = null;
        if (includeCsp)
        {
            var allCspPolicies = policyRepository.Load().ToList();
            cspPolicies = includeCspPageOverrides ? allCspPolicies : [.. allCspPolicies.Where(p => string.IsNullOrEmpty(p.ContentLink))];
            cspContentReferences = BuildContentReferences(cspPolicies.Select(p => p.ContentLink));
        }

        List<PermissionPolicy>? permissions = null;
        List<ContentLinkReference>? permissionsContentReferences = null;
        if (includePermissions)
        {
            var allPermissions = permissionsRepository.Load().ToList();
            permissions = includePermissionsPageOverrides ? allPermissions : [.. allPermissions.Where(p => string.IsNullOrEmpty(p.ContentLink))];
            permissionsContentReferences = BuildContentReferences(permissions.Select(p => p.ContentLink));
        }

        var export = new JhoooseSecurityExport
        {
            Metadata = new ExportMetadata(),
            CspSettings = includeSettings ? settingsRepository.Load() : null,
            CspPolicies = cspPolicies,
            Permissions = permissions,
            ResponseHeaders = includeHeaders ? [.. responseHeadersRepository.Load()] : null,
            IpRestrictions = includeIpRestrictions ? [.. ipRestrictionRepository.Load()] : null,
            IpRestrictionIgnoredPaths = includeIpRestrictions ? [.. ipRestrictionIgnoredPathRepository.Load()] : null,
            IpRestrictionIgnoreHeaders = includeIpRestrictions ? [.. ipRestrictionIgnoreHeaderRepository.Load()] : null,
            CspContentReferences = cspContentReferences,
            PermissionsContentReferences = permissionsContentReferences
        };

        var hash = ObjectHasher.ComputeHash(export);
        export.IntegrityHash = hash;

        return export;
    }

    private List<ContentLinkReference>? BuildContentReferences(IEnumerable<string> contentLinks)
    {
        var distinctLinks = contentLinks.Where(c => !string.IsNullOrEmpty(c)).Distinct().ToList();
        if (distinctLinks.Count == 0)
        {
            return null;
        }

        var references = new List<ContentLinkReference>();
        foreach (var contentLink in distinctLinks)
        {
            if (ContentReference.TryParse(contentLink, out var contentReference) &&
                contentLoader.TryGet<IContent>(contentReference, out var content))
            {
                references.Add(new ContentLinkReference(contentLink, content.ContentGuid.ToString(), content.Name));
            }
        }

        return references.Count > 0 ? references : null;
    }

    protected virtual void HandleSettingsImport(JhoooseSecurityExport export)
    {
        if (export.CspSettings != null)
        {
            settingsRepository.SaveSettings(export.CspSettings);
        }
    }

    protected virtual void HandleCspImport(JhoooseSecurityExport export, List<string> warnings)
    {
        if (export.CspPolicies != null && export.CspPolicies.Count > 0)
        {
            var referenceMap = (export.CspContentReferences ?? []).ToDictionary(r => r.ContentLink);

            policyRepository.Clear();

            foreach (var policy in export.CspPolicies)
            {
                if (!ResolveContentLink(policy.ContentLink, referenceMap, warnings, "CSP", out var resolvedContentLink))
                {
                    continue;
                }

                policy.ContentLink = resolvedContentLink;
                policyRepository.Save(policy);
            }
        }
    }

    protected virtual void HandlePermissionsImport(JhoooseSecurityExport export, List<string> warnings)
    {
        if (export.Permissions != null && export.Permissions.Count > 0)
        {
            var referenceMap = (export.PermissionsContentReferences ?? []).ToDictionary(r => r.ContentLink);

            permissionsRepository.Clear();
            foreach (var policy in export.Permissions)
            {
                if (!ResolveContentLink(policy.ContentLink, referenceMap, warnings, "Permissions", out var resolvedContentLink))
                {
                    continue;
                }

                policy.ContentLink = resolvedContentLink;
                permissionsRepository.Save(policy);
            }
        }
    }

    private bool ResolveContentLink(string contentLink, Dictionary<string, ContentLinkReference> referenceMap, List<string> warnings, string policyType, out string resolvedContentLink)
    {
        resolvedContentLink = contentLink;

        if (string.IsNullOrEmpty(contentLink))
        {
            return true;
        }

        if (!referenceMap.TryGetValue(contentLink, out var reference))
        {
            // No portable reference available (legacy export, or same-environment round trip) - keep as-is.
            return true;
        }

        if (Guid.TryParse(reference.ContentGuid, out var contentGuid) && contentLoader.TryGet<IContent>(contentGuid, out var content))
        {
            resolvedContentLink = content.ContentLink.ID.ToString();
            return true;
        }

        warnings.Add($"Skipped {policyType} override for '{reference.Name ?? reference.ContentLink}' (page not found in this environment).");
        return false;
    }

    protected virtual void HandleResponseHeadersImport(JhoooseSecurityExport export)
    {
        if (export.ResponseHeaders != null && export.ResponseHeaders.Count > 0)
        {
            var existingHeaders = responseHeadersRepository.Load();
            foreach (var header in export.ResponseHeaders)
            {
                var existingHeader = existingHeaders.FirstOrDefault(h => h.Name == header.Name);
                if (existingHeader != null)
                {
                    header.Id = existingHeader.Id; // Update
                    responseHeadersRepository.Save(header);
                }
            }
        }
    }

    protected virtual void HandleIpRestrictionsImport(JhoooseSecurityExport export)
    {
        if (export.IpRestrictions != null && export.IpRestrictions.Count > 0)
        {
            ipRestrictionRepository.Clear();
            foreach (var entry in export.IpRestrictions)
            {
                ipRestrictionRepository.Save(entry);
            }
        }
    }

    protected virtual void HandleIpRestrictionIgnoredPathsImport(JhoooseSecurityExport export)
    {
        if (export.IpRestrictionIgnoredPaths != null && export.IpRestrictionIgnoredPaths.Count > 0)
        {
            ipRestrictionIgnoredPathRepository.Clear();
            foreach (var entry in export.IpRestrictionIgnoredPaths)
            {
                ipRestrictionIgnoredPathRepository.Save(entry);
            }
        }
    }

    protected virtual void HandleIpRestrictionIgnoreHeadersImport(JhoooseSecurityExport export)
    {
        if (export.IpRestrictionIgnoreHeaders != null && export.IpRestrictionIgnoreHeaders.Count > 0)
        {
            ipRestrictionIgnoreHeaderRepository.Clear();
            foreach (var entry in export.IpRestrictionIgnoreHeaders)
            {
                ipRestrictionIgnoreHeaderRepository.Save(entry);
            }
        }
    }
}
