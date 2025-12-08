using System.Threading.Tasks;

using Jhoose.Security.Features.Reporting.Models.Dashboard;
using Jhoose.Security.Features.Reporting.Models.Search;

namespace Jhoose.Security.Features.Reporting;

public interface IDashboardService
{
    Task<DashboardSummary> BuildSummary(DashboardSummaryQuery query);

    Task<CspSearchResults> Search(CspSearchParams searchParams);
}