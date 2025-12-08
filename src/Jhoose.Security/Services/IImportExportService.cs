using Jhoose.Security.Models.Export;

namespace Jhoose.Security.Services;

public interface IImportExportService
{
    JhoooseSecurityExport Export(bool includeCsp = true,bool includePermissions = true, bool includeHeaders = true, bool includeSettings = true);
    void Import(JhoooseSecurityExport export);
    bool IsValid(JhoooseSecurityExport export);
}