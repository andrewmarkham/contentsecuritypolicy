using System;
using System.Collections.Generic;

using Jhoose.Security.Models.Export;

namespace Jhoose.Security.Services;

public interface IImportRepository
{
    void Save(JhoooseSecurityExport export);
    IEnumerable<JhoooseSecurityExportRecord> List();

    JhoooseSecurityExport? Get(Guid id);

    void Delete(Guid id);

}