using System;

using EPiServer.PlugIn;
using EPiServer.Scheduler;

using Jhoose.Security.Configuration;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Jhoose.Security.Features.Reporting.Jobs;

[ScheduledPlugIn(DisplayName = "Purge Jhoose Security Reporting Data", Description = "Purge old reporting data")]
public class PurgeReporintgDataJob : ScheduledJobBase
{
    private readonly IReportingRepositoryFactory reportingRepositoryFactory;
    private readonly IOptions<ReportingOptions> options;
    private readonly ILogger<PurgeReporintgDataJob> logger;
    private bool stopSignaled;

    public PurgeReporintgDataJob(IReportingRepositoryFactory reportingRepositoryFactory,
                                 IOptions<ReportingOptions> options,
                                 ILogger<PurgeReporintgDataJob> logger) : base()
    {
        this.reportingRepositoryFactory = reportingRepositoryFactory;
        this.options = options;
        this.logger = logger;
        this.IsStoppable = true;
    }

    public override void Stop() => stopSignaled = true;

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
            var batchSize = options.Value.PurgeBatchSize;

            // PurgeBatchSize <= 0 disables batching and preserves the original
            // single-DELETE behavior for anyone who relied on it.
            if (batchSize <= 0)
            {
                var purgedOnce = reportingRepository.PurgeReporingData(beforeDate).Result;
                return $"Purged {purgedOnce} records, from before {beforeDate}";
            }

            var totalPurged = 0;
            var batches = 0;

            OnStatusChanged($"Purging reporting rows older than {beforeDate:u} in batches of {batchSize}...");

            while (!stopSignaled)
            {
                var purgedInBatch = reportingRepository.PurgeReporingData(beforeDate, batchSize).Result;
                if (purgedInBatch <= 0)
                {
                    break;
                }

                totalPurged += purgedInBatch;
                batches++;
                OnStatusChanged($"Batch {batches}: purged {purgedInBatch} (total {totalPurged}).");
            }

            return stopSignaled
                ? $"Stopped. Purged {totalPurged} records, from before {beforeDate} across {batches} batches."
                : $"Purged {totalPurged} records, from before {beforeDate} across {batches} batches.";
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error purging reporting data");
            return $"Error purging reporting data: {ex.Message}";
        }

    }
}