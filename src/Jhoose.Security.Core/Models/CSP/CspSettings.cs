using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Jhoose.Security.Core.Models.CSP
{
    public enum ReportingMode
    {
        None = 0,
        Local = 1,
        External = 2
    }

    public class CspSettings
    {
        public CspSettings()
        {
            this.Mode = "off";
            this.ReportingMode = ReportingMode.None;
        }

        public Guid Id { get; set; }
        public string Mode { get; set; }

        public ReportingMode ReportingMode { get; set; }

        /// <summary>
        /// Used for the report-uri directive
        /// </summary>
        public string ReportingUrl { get; set; } = string.Empty;

        /// <summary>
        /// Used by the report-to directive
        /// </summary>
        public string ReportToUrl { get; set; } = string.Empty;

        /// <summary>
        /// Urls that will be triggered when the settings change
        /// </summary>
        public List<string>? WebhookUrls { get; set; } = [];

        public List<AuthenticationKey>? AuthenticationKeys { get; set; } = [];

        [JsonIgnore]
        public bool HasReporting => !string.IsNullOrEmpty(this.ReportingUrl) | !string.IsNullOrEmpty(this.ReportToUrl);

        [JsonIgnore]
        public bool IsEnabled => this.Mode.Equals("off") ? false : true;

        [JsonIgnore]
        public string PolicyHeader => this.Mode.Equals("on", StringComparison.CurrentCultureIgnoreCase) ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only";
    }
}