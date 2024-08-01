using Jhoose.Security.Reporting.Models.Dashboard;
using Jhoose.Security.Reporting.Models.Search;

namespace Jhoose.Security.Reporting;

public interface IDashboardService
{
    Task<DashboardSummary> BuildSummary(DashboardSummaryQuery query);

    Task<CspSearchResults> Search(CspSearchParams searchParams);
}   
