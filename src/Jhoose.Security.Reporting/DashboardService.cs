using Jhoose.Security.Reporting.Models.Dashboard;
using Jhoose.Security.Reporting.Models.Search;

namespace Jhoose.Security.Reporting;

public class DashboardService : IDashboardService
{
    private readonly IReportingRepository reportingRepository;

    public DashboardService(IReportingRepositoryFactory reportingRepositoryFactory)
    {
        this.reportingRepository = reportingRepositoryFactory.GetReportingRepository() ?? throw new ArgumentNullException(nameof(reportingRepository));
    }

    public async Task<DashboardSummary> BuildSummary(DashboardSummaryQuery query)
    {
        var timeframeInMinutes = TimeframeToMinutes(query.Timeframe);

        var summary = new DashboardSummary
        {
            Query = new DashboardQuery
            {
                Type = query.Type,
                Timeframe = query.Timeframe,
                Title = query.Type,
                From = DateTime.UtcNow.AddMinutes(timeframeInMinutes * -1),
                To = DateTime.UtcNow
            },
        };

        var reports = await reportingRepository.GetDashboardSummary(summary);

        return summary;
    }

    public async Task<CspSearchResults> Search(CspSearchParams searchParams)
    {
        return await reportingRepository.Search(searchParams);
    }
    protected virtual int TimeframeToMinutes(string timeframe)
    {
        int minutes = 0;
        switch (timeframe)
        {
            case "30m":
                minutes = 30;
                break;
            case "1h":
                minutes = 60;
                break;
            case "6h":
                minutes = 360;
                break;
            case "12h":
                minutes = 720;
                break;
            case "1d":
                minutes = 1440;
                break;
            case "3d":
                minutes = 1440 * 3;
                break;
            case "7d":
                minutes = 1440 * 7;
                break;
        }
        return minutes;
    }
}