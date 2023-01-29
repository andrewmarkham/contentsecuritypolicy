
using System;

#if NET5_0_OR_GREATER
using System.Text.Json.Serialization;
#else
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
#endif

namespace Jhoose.Security.Core.Models
{
#if NET461_OR_GREATER
    [JsonObject(NamingStrategyType = typeof(CamelCaseNamingStrategy))]
#endif
    public class CspSettings
    {
        public Guid Id { get; } = Guid.Parse("3f15cad4-cd57-41c3-95c8-f7f62a2759ea");
        public string Mode { get; set; }
        public string ReportingUrl { get; set; }

        [JsonIgnore]
        public bool IsEnabled => this.Mode.Equals("off") ? false : true;

        [JsonIgnore]
        public string PolicyHeader => this.Mode.Equals("on", StringComparison.CurrentCultureIgnoreCase) ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only";

    }
}