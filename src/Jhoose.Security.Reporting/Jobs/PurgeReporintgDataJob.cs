using EPiServer.PlugIn;
using EPiServer.Scheduler;

using Jhoose.Security.Core.Configuration;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Jhoose.Security.Reporting.Jobs;

[ScheduledPlugIn(DisplayName = "Purge Jhoose Security Reporting Data", Description = "Purge old reporting data")]
public class PurgeReporintgDataJob : ScheduledJobBase
{
    private readonly IReportingRepositoryFactory reportingRepositoryFactory;
    private readonly IOptions<ReportingOptions> options;
    private readonly ILogger<PurgeReporintgDataJob> logger;

    public PurgeReporintgDataJob(IReportingRepositoryFactory reportingRepositoryFactory,
                                 IOptions<ReportingOptions> options,
                                 ILogger<PurgeReporintgDataJob> logger) : base()
    {
        this.reportingRepositoryFactory = reportingRepositoryFactory;
        this.options = options;
        this.logger = logger;
    }

    public override string Execute()
    {
        var reportingRepository = reportingRepositoryFactory.GetReportingRepository();
        if (reportingRepository == null)
        {
            return "No reporting repository found";
        }

        try
        {
            if (options.Value.RetainDays <= 0)
            {
                return "Retain days is set to 0 or less, no data purged";
            }

            var beforeDate = DateTime.UtcNow.AddDays(options.Value.RetainDays * -1);
            var purged = reportingRepository.PurgeReporingData(beforeDate).Result;

            return $"Purged {purged} records, from before {beforeDate}";
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error purging reporting data");
            return $"Error purging reporting data: {ex.Message}";
        }

    }
}