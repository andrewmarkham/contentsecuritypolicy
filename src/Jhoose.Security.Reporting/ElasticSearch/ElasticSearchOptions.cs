namespace Jhoose.Security.Reporting.ElasticSearch;

public class ElasticSearchReportingOptions 
{
    public string IndexName { get; set; } = "security-reporting";
    public List<string>? EndPoints { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string CertificateFingerprint { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    
    /// <summary>
    /// The cloud id for the elastic cloud instance
    /// </summary>
    public string CloudId { get; set; } = string.Empty;

    internal List<Uri> Servers => EndPoints?.Select(e => new Uri(e)).ToList() ?? [];
}