using Jhoose.Security.Reporting.Models;
using Jhoose.Security.Reporting.Models.Dashboard;
using Jhoose.Security.Reporting.Models.Search;

namespace Jhoose.Security.Reporting;

public interface IReportingRepository
{
    string Type { get; }

    Task AddReport(ReportTo<IReportToBody> reportTo);

    Task AddReports(IEnumerable<ReportTo<IReportToBody>> reportTo);

    Task<DashboardSummary> GetDashboardSummary(DashboardSummary summary);

    Task<int> PurgeReporingData(DateTime beforeDate);

    Task<CspSearchResults> Search(CspSearchParams searchParams);
}