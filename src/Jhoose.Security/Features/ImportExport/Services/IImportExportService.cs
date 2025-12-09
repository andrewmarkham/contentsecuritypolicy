using Jhoose.Security.Features.ImportExport.Models;

namespace Jhoose.Security.Features.ImportExport.Services;

public interface IImportExportService
{
    JhoooseSecurityExport Export(bool includeCsp = true,bool includePermissions = true, bool includeHeaders = true, bool includeSettings = true);
    void Import(JhoooseSecurityExport export);
    bool IsValid(JhoooseSecurityExport export);
}