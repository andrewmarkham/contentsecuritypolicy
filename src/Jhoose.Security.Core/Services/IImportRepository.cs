using System;
using System.Collections.Generic;

using Jhoose.Security.Core.Models.Export;

namespace Jhoose.Security.Core.Services;

public interface IImportRepository
{
    void Save(JhoooseSecurityExport export);
    IEnumerable<JhoooseSecurityExportRecord> List();

    JhoooseSecurityExport? Get(Guid id);

    void Delete(Guid id);

}