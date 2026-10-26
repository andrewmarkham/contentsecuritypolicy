using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;

using EPiServer.Data.Dynamic;

using Jhoose.Security.Features.ImportExport.Models;
using Jhoose.Security.Features.ImportExport.Services;

using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Features.ImportExport.Repository;

public class JhooseImportRepository : IImportRepository
{
    private readonly ILogger<JhooseImportRepository> logger;
    private readonly IImportExportService importExportService;
    protected readonly DynamicDataStoreFactory dataStoreFactory;
    private readonly DynamicDataStore exportStore;

    public JhooseImportRepository(ILogger<JhooseImportRepository> logger,
                                 IImportExportService importExportService,
                                 DynamicDataStoreFactory dataStoreFactory)
    {
        this.dataStoreFactory = dataStoreFactory;

        var storeParams = new StoreDefinitionParameters();
        storeParams.IndexNames.Add("Id");
        this.exportStore = dataStoreFactory.CreateStore(typeof(JhoooseSecurityExportRecord).FullName, typeof(JhoooseSecurityExportRecord));

        this.logger = logger;
        this.importExportService = importExportService;
    }

    public void Save(JhoooseSecurityExport export)
    {
        Save(importExportService.GetImportStatus(export), System.Text.Json.JsonSerializer.Serialize(export));
    }

    public void SaveInvalid(string json)
    {
        Save(ImportStatus.Invalid, json);
    }

    private void Save(string status, string serializedExport)
    {
        var exportRecord = new JhoooseSecurityExportRecord
        {
            Id = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            Status = status,
            SerializedExport = serializedExport
        };

        this.logger.LogInformation("Saving export with ID: {ExportId}, status: {Status}", exportRecord.Id, status);

        this.exportStore.Save(exportRecord);
    }

    public IEnumerable<JhoooseSecurityExportRecord> List()
    {
        foreach (var record in this.exportStore.Items<JhoooseSecurityExportRecord>())
        {
            // Earlier versions marked an import Invalid whenever the hash didn't match, so work out the
            // status again for those that can be read. Only Invalid records are read, to keep the list cheap.
            if (record.Status == ImportStatus.Invalid && TryDeserialize(record, out var export))
            {
                record.Status = importExportService.GetImportStatus(export);
            }

            yield return record;
        }
    }

    public JhoooseSecurityExportRecord? GetRecord(Guid id)
    {
        return this.exportStore.Load(id) as JhoooseSecurityExportRecord;
    }

    public JhoooseSecurityExport? Get(Guid id)
    {
        var exportRecord = GetRecord(id);

        // An invalid record holds the file as uploaded, which can't be read as an export. Records saved by
        // earlier versions could be marked Invalid only because the hash didn't match, so rely on whether the
        // export can be read rather than on the status.
        return exportRecord != null && TryDeserialize(exportRecord, out var export) ? export : null;
    }

    private bool TryDeserialize(JhoooseSecurityExportRecord record, [NotNullWhen(true)] out JhoooseSecurityExport? export)
    {
        try
        {
            export = System.Text.Json.JsonSerializer.Deserialize<JhoooseSecurityExport>(record.SerializedExport);
        }
        catch (System.Text.Json.JsonException ex)
        {
            this.logger.LogWarning(ex, "Import {ExportId} can't be read as an export", record.Id);
            export = null;
        }

        return export?.Metadata != null;
    }

    public void Delete(Guid id)
    {
        this.exportStore.Delete(id);
    }
}