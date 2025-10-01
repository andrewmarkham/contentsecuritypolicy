using System.Collections.Generic;

namespace Jhoose.Security.Core.Configuration
{
    public class ReportingProvider
    {
        public string Type { get; set; } = string.Empty;

        public Dictionary<string, string> Params { get; set; } = [];

    }
}