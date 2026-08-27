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

    Task<int> PurgeReporingData(DateTime beforeDate);

    Task<CspSearchResults> Search(CspSearchParams searchParams);
}