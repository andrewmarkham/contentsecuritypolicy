using System.Collections.Generic;

namespace Jhoose.Security.Configuration;

public class ReportingOptions
{
    public int RetainDays { get; set; } = 30;

    /// <summary>
    /// Maximum rows the purge job deletes per batch. Set to 0 to disable batching
    /// (issue a single unbounded DELETE, matching pre-batching behavior).
    /// Only the SQL provider honors this; ElasticSearch handles bulk deletes natively.
    /// </summary>
    public int PurgeBatchSize { get; set; } = 5000;

    public string UseProvider { get; set; } = string.Empty;

    public string ConnectionString { get; set; } = string.Empty;

    public RateLimiting RateLimiting { get; set; } = new RateLimiting();

    public List<ReportingProvider> Providers { get; set; } = [];
}