
using System;

using System.Text.Json.Serialization;

namespace Jhoose.Security.Core.Models.CSP
{
    public class CspSettings
    {
        public Guid Id { get; } = Guid.Parse("3f15cad4-cd57-41c3-95c8-f7f62a2759ea");
        public string Mode { get; set; }

        /// <summary>
        /// Used for the report-uri directive
        /// </summary>
        public string ReportingUrl { get; set; }

        /// <summary>
        /// Used by the report-to directive
        /// </summary>
        public string ReportToUrl { get; set; }

        [JsonIgnore]
        public bool HasReporting => !string.IsNullOrEmpty(this.ReportingUrl) | !string.IsNullOrEmpty(this.ReportToUrl);

        [JsonIgnore]
        public bool IsEnabled => this.Mode.Equals("off") ? false : true;

        [JsonIgnore]
        public string PolicyHeader => this.Mode.Equals("on", StringComparison.CurrentCultureIgnoreCase) ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only";

    }
}