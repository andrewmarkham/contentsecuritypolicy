using System.Text.Json.Serialization;

namespace Jhoose.Security.Reporting.Models.Search
{
    public class CspSearchResult
    {
        public string Id { get; set; } = string.Empty;
        public int Age { get; set; }
        public DateTime RecievedAt { get; set; }
        public string Type { get; set; } = "csp-violation";
        public string Url { get; set; } = string.Empty;

        [JsonPropertyName("user_agent")]
        public string UserAgent { get; set; } = string.Empty;

        public string Browser { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public string Os { get; set; } = string.Empty;
        public  string Directive { get; set; }  = string.Empty;
        public  string BlockedUri { get; set; } = string.Empty;

        public BodyData? Body { get; set; }
    }


    public class CspSearchParams {

        public string? SortField { get; set; }

        public string SortOrder { get; set; } = "ascend";

        public int Page { get; set; }
        public int PageSize { get; set; }

        public CspSearchFilter? Filters { get; set; }
    }

    public class CspSearchFilter {
        public string? Query { get; set; }
        public DateTime? DateFrom { get; set; }
        public List<string>? Browser { get; set; }
        public List<string>? Directive { get; set; }

        public bool HasFilters() {
            return !string.IsNullOrEmpty(Query) || DateFrom.HasValue || Browser?.Count > 0 || Directive?.Count > 0;
        }
    }
}

