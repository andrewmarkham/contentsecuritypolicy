using System;
using System.Collections.Generic;

using Jhoose.Security.Features.ImportExport.Models;

namespace Jhoose.Security.Features.ImportExport.Repository;

public interface IImportRepository
{
    void Save(JhoooseSecurityExport export);

    /// <summary>
    /// Saves an uploaded file that couldn't be read as an export, so it is listed with an Invalid status.
    /// </summary>
    void SaveInvalid(string json);

    IEnumerable<JhoooseSecurityExportRecord> List();

    JhoooseSecurityExportRecord? GetRecord(Guid id);

    JhoooseSecurityExport? Get(Guid id);

    void Delete(Guid id);

}