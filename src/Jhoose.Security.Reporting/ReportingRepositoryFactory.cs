using Jhoose.Security.Core.Configuration;

using Microsoft.Extensions.Options;

namespace Jhoose.Security.Reporting;

public class ReportingRepositoryFactory(IOptions<ReportingOptions> options, IEnumerable<IReportingRepository> reportingRepositories) : IReportingRepositoryFactory
{
    private readonly IOptions<ReportingOptions> options = options;
    private readonly IEnumerable<IReportingRepository> reportingRepositories = reportingRepositories;

    public IReportingRepository? GetReportingRepository() => reportingRepositories.FirstOrDefault(r => r.Type.Equals(options.Value.UseProvider, StringComparison.OrdinalIgnoreCase));
}