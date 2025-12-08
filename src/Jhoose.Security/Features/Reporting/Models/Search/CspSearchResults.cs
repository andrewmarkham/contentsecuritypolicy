using System.Collections.Generic;

namespace Jhoose.Security.Features.Reporting.Models.Search;

public class CspSearchResults
{
    public long Total { get; set; } = 0;
    public List<CspSearchResult> Results { get; set; } = [];

    public List<string> Directives { get; set; } = [];
    public List<string> Browsers { get; set; } = [];

    public List<string> Types { get; set; } = [];
}