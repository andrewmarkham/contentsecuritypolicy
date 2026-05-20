using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Jhoose.Security.Features.Reporting.Models;
using Jhoose.Security.Features.Reporting.Models.Dashboard;
using Jhoose.Security.Features.Reporting.Models.Search;

namespace Jhoose.Security.Features.Reporting;

public interface IReportingRepository
{
    string Type { get; }

    Task AddReport(ReportTo<IReportToBody> reportTo);

    Task AddReports(IEnumerable<ReportTo<IReportToBody>> reportTo);
    
    Task<DashboardSummary> GetDashboardSummary(DashboardSummary summary);

    /// <summary>
    /// Deletes reporting rows older than <paramref name="beforeDate"/>.
    /// When <paramref name="batchSize"/> is provided and greater than zero, providers
    /// that support it should delete at most that many rows per call so callers can
    /// loop and bound the work each query does (avoiding command-timeout rollbacks on
    /// large tables). When null, the call behaves as before and deletes everything in
    /// one statement.
    /// </summary>
    Task<int> PurgeReporingData(DateTime beforeDate, int? batchSize = null);

    Task<CspSearchResults> Search(CspSearchParams searchParams);
}