
using System.Text.Json.Serialization;

namespace Jhoose.Security.Reporting.Models
{
    public class ReportUri
    {
        [JsonConstructor]
        public ReportUri(
            CspReport cspReport
        )
        {
            CspReport = cspReport;
        }

        [JsonPropertyName("csp-report")]
        public CspReport CspReport { get; }
    }
}