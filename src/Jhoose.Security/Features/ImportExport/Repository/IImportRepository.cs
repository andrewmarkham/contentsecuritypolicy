using System;
using System.Collections.Generic;

using Jhoose.Security.Features.ImportExport.Models;

namespace Jhoose.Security.Features.ImportExport.Repository;

public interface IImportRepository
{
    void Save(JhoooseSecurityExport export);
    IEnumerable<JhoooseSecurityExportRecord> List();

    JhoooseSecurityExport? Get(Guid id);

    void Delete(Guid id);

}