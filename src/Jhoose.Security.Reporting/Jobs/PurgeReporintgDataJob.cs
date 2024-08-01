using EPiServer.PlugIn;
using EPiServer.Scheduler;
using Jhoose.Security.Core.Configuration;
using Microsoft.Extensions.Options;

namespace Jhoose.Security.Reporting.Jobs;

[ScheduledPlugIn(DisplayName = "Purge Jhoose Security Reporting Data", Description = "Purge old reporting data")]
public class PurgeReporintgDataJob : ScheduledJobBase
{
    private readonly IReportingRepositoryFactory reportingRepositoryFactory;
    private readonly IOptions<ReportingOptions> options;

    public PurgeReporintgDataJob(IReportingRepositoryFactory reportingRepositoryFactory, IOptions<ReportingOptions> options) : base()
    {
        this.reportingRepositoryFactory = reportingRepositoryFactory;
        this.options = options;
    }

    public override string Execute()
    {
        var reportingRepository = reportingRepositoryFactory.GetReportingRepository();
        if (reportingRepository == null)
        {
            return "No reporting repository found";
        }

        var beforeDate = DateTime.UtcNow.AddDays(options.Value.RetainDays * -1);
        var purged = reportingRepository.PurgeReporingData(beforeDate).Result;

        return $"Purged {purged} records";
    }
}