using System;
using System.Collections.Generic;
using Jhoose.Security.Core.Models.Export;

namespace Jhoose.Security.Core.Services;

public interface IImportExportService
{
    JhoooseSecurityExport Export(bool includeCsp = true, bool includeHeaders = true, bool includeSettings = true);
    void Import(JhoooseSecurityExport export);
    bool IsValid(JhoooseSecurityExport export);
}
