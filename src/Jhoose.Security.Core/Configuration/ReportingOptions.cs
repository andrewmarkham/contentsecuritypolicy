using System.Collections.Generic;

namespace Jhoose.Security.Core.Configuration
{
    public class ReportingOptions
    {
        public int RetainDays { get; set; } = 30;

        public string UseProvider { get; set; } = string.Empty;

        public string ConnectionString { get; set; } = string.Empty;

        public RateLimiting RateLimiting { get; set; } = new RateLimiting();

        public List<ReportingProvider> Providers { get; set; } = [];
    }
}

