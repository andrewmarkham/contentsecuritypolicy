using Jhoose.Security.Core.Repository;

using Microsoft.Extensions.Logging;
using Jhoose.Security.Core.Models.Export;
using Jhoose.Security.Core.Helpers;
using System.Linq;

namespace Jhoose.Security.Core.Services;

public class ImportExportService : IImportExportService
{
    private readonly ILogger<ImportExportService> logger;
    private readonly ICspPolicyRepository policyRepository;
    private readonly IResponseHeadersRepository responseHeadersRepository;

    public ImportExportService(ICspPolicyRepository policyRepository,
                              IResponseHeadersRepository responseHeadersRepository,
                              ILogger<ImportExportService> logger)
    {
        this.logger = logger;
        this.policyRepository = policyRepository;
        this.responseHeadersRepository = responseHeadersRepository;
    }

    public void Import(JhoooseSecurityExport export)
    {
        //handle settings import
        HandleSettingsImport(export);

        //handle policies import
        HandleCspImport(export);

        //handle response headers import
        HandleResponseHeadersImport(export);
    }

    public bool IsValid(JhoooseSecurityExport export)
    {
        var receivedHash = export.IntegrityHash;
        export.IntegrityHash = string.Empty; // Remove hash for recalculation
        var computedHash = ObjectHasher.ComputeHash(export);

        return receivedHash == computedHash;
    }

    public JhoooseSecurityExport Export(bool includeCsp = true, bool includeHeaders = true, bool includeSettings = true)
    {
        var export = new JhoooseSecurityExport
        {
            Metadata = new ExportMetadata(),
            CspSettings = includeSettings ? policyRepository.Settings() : null,
            CspPolicies = includeCsp ? policyRepository.List() : null,
            ResponseHeaders = includeHeaders ? [..responseHeadersRepository.List()] : null  
        };

        var hash = ObjectHasher.ComputeHash(export);
        export.IntegrityHash = hash;

        return export;
    }

    protected virtual void HandleSettingsImport(JhoooseSecurityExport export)
    {
        if (export.CspSettings != null)
        {
            policyRepository.SaveSettings(export.CspSettings);
        }
    }

    protected virtual void HandleCspImport(JhoooseSecurityExport export)
    {
        if (export.CspPolicies != null && export.CspPolicies.Count > 0)
        {
            var existingPolicies = policyRepository.List();
            foreach (var policy in export.CspPolicies)
            {
                var existingPolicy = existingPolicies.FirstOrDefault(p => p.PolicyName == policy.PolicyName);
                if (existingPolicy != null)
                {
                    policy.Id = existingPolicy.Id; // Update
                    policyRepository.Update(policy);
                }
            }
        }
    }

    protected virtual void HandleResponseHeadersImport(JhoooseSecurityExport export)
    {
        if (export.ResponseHeaders != null && export.ResponseHeaders.Count > 0)
        {
            var existingHeaders = responseHeadersRepository.List();
            foreach (var header in export.ResponseHeaders)
            {
                var existingHeader = existingHeaders.FirstOrDefault(h => h.Name == header.Name);
                if (existingHeader != null)
                {
                    header.Id = existingHeader.Id; // Update
                    responseHeadersRepository.Update(header);
                }
            }
        }
    }
}