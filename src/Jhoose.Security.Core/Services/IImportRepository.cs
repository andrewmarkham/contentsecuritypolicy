using System;
using System.Collections.Generic;
using EPiServer.Data.Dynamic;
using Jhoose.Security.Core.Models.Export;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Core.Services;

public interface IImportRepository
{
    void Save(JhoooseSecurityExport export);
    IEnumerable<JhoooseSecurityExportRecord> List();

    JhoooseSecurityExport? Get(Guid id);

    void Delete(Guid id);

}
