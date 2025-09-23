using System;
using System.Collections.Generic;
using EPiServer.Data.Dynamic;
using Jhoose.Security.Core.Models.Export;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Core.Services;

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
        var IsValid = importExportService.IsValid(export);

        var exportRecord = new JhoooseSecurityExportRecord
        {
            Id = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            Status = IsValid ? "Valid" : "Invalid",
            SerializedExport = System.Text.Json.JsonSerializer.Serialize(export)
        };

        this.logger.LogInformation("Saving export with ID: {ExportId}", exportRecord.Id);

        this.exportStore.Save(exportRecord);
    }

    public IEnumerable<JhoooseSecurityExportRecord> List()
    {
        return this.exportStore.Items<JhoooseSecurityExportRecord>();
    }

    public JhoooseSecurityExport? Get(Guid id)
    {
        var exportRecord = this.exportStore.Load(id) as JhoooseSecurityExportRecord;
        return exportRecord != null ? System.Text.Json.JsonSerializer.Deserialize<JhoooseSecurityExport>(exportRecord.SerializedExport) : null;
    }

    public void Delete(Guid id)
    {
        this.exportStore.Delete(id);
    }
}