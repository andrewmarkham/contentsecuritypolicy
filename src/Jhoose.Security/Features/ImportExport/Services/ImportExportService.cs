using System.Linq;

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
                          ILogger<ImportExportService> logger) : IImportExportService
{
    public void Import(JhoooseSecurityExport export)
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

        //handle settings import
        HandleSettingsImport(export);

        //handle policies import
        HandleCspImport(export);

        //handle permissions import
        HandlePermissionsImport(export);

        //handle response headers import
        HandleResponseHeadersImport(export);

        //handle ip restrictions import
        HandleIpRestrictionsImport(export);

        //handle ip restriction ignored paths import
        HandleIpRestrictionIgnoredPathsImport(export);

        //handle ip restriction ignore headers import
        HandleIpRestrictionIgnoreHeadersImport(export);
    }

    public bool IsValid(JhoooseSecurityExport export)
    {
        var receivedHash = export.IntegrityHash;
        export.IntegrityHash = string.Empty; // Remove hash for recalculation
        var computedHash = ObjectHasher.ComputeHash(export);

        return receivedHash == computedHash;
    }

    public JhoooseSecurityExport Export(bool includeCsp = true, bool includePermissions = true, bool includeHeaders = true, bool includeSettings = true, bool includeIpRestrictions = true)
    {
        var export = new JhoooseSecurityExport
        {
            Metadata = new ExportMetadata(),
            CspSettings = includeSettings ? settingsRepository.Load() : null,
            CspPolicies = includeCsp ? [.. policyRepository.Load()] : null,
            Permissions = includePermissions ? [.. permissionsRepository.Load()] : null,
            ResponseHeaders = includeHeaders ? [.. responseHeadersRepository.Load()] : null,
            IpRestrictions = includeIpRestrictions ? [.. ipRestrictionRepository.Load()] : null,
            IpRestrictionIgnoredPaths = includeIpRestrictions ? [.. ipRestrictionIgnoredPathRepository.Load()] : null,
            IpRestrictionIgnoreHeaders = includeIpRestrictions ? [.. ipRestrictionIgnoreHeaderRepository.Load()] : null
        };

        var hash = ObjectHasher.ComputeHash(export);
        export.IntegrityHash = hash;

        return export;
    }

    protected virtual void HandleSettingsImport(JhoooseSecurityExport export)
    {
        if (export.CspSettings != null)
        {
            settingsRepository.SaveSettings(export.CspSettings);
        }
    }

    protected virtual void HandleCspImport(JhoooseSecurityExport export)
    {
        if (export.CspPolicies != null && export.CspPolicies.Count > 0)
        {
            policyRepository.Clear();
            
            foreach (var policy in export.CspPolicies)
            {
                policyRepository.Save(policy);
            }
        }
    }

    protected virtual void HandlePermissionsImport(JhoooseSecurityExport export)
    {
        if (export.Permissions != null && export.Permissions.Count > 0)
        {
            permissionsRepository.Clear();
            foreach (var policy in export.Permissions)
            {
                permissionsRepository.Save(policy);
            }
        }
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