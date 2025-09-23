namespace Jhoose.Security.Reporting.Models.Search
{
    public class CspSearchResults
    {
        public long Total { get; set; } = 0;
        public List<CspSearchResult> Results { get; set; } = [];

        public List<string> Directives { get; set; } = [];
        public List<string> Browsers { get; set; } = [];
    }
}

