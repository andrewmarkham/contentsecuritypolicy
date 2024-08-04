# Issue Dashboard

## Configuration

``` json
"JhooseSecurity": {
    ...
    "Reporting" :{
      "RetainDays": 30,                  // Data retention (in days) requires the scheduled job to be ran to actually remove data.
      "UseProvider": "...",              // Override the default provider with an alternative.  Is matched on the provider type
      "ConnectionString": "...",         // Override the default connection string
      "RateLimit": {                     // Limit the number of requests the api that records the issue will accept (.NET7+)
        "Enabled": true,
        "PermitLimit": 100,              // Number of requests per window
        "QueueLimit": 100,               // Number of requests to queue per window
        "WindowSeconds": 60              // Duration (in seconds) for the window.
      },
      "Providers":[                      // Collection of customer providers
      ]
    }
    ...
  }
```

### Enabling Elastic Search
You can enable elastic search as a repository for any CSP issues.  You may want to do this if you want to store issues for a longer period.

You can use Elastic Cloud, an alternate cloud provider or an instance you are hosting yourself.


``` json
"JhooseSecurity": {
    ...
    "Reporting" :{
 
      "UseProvider": "ElasticSearch",    // Override the 
      "Providers":[                      
        {
          "Type": "ElasticSearch",       // Defines Elastic s
          "Params": {
            "IndexName": "reporting",    // override the default index name.
            "UserName": "...",
            "Password": "...",
            "CertificateFingerprint": "...",
            "ApiKey": "",                // Required if you use Elastic Cloud
            "CloudId": "",               // Required if you use Elastic Cloud
            "EndPoints": "<...>;<...>"   // If you have multiple servers configured, then include them all there and seperate with a ; (semi-colon)
          }
        }
      ]
    }
    ...
  }
  ```

## Custom Provider
If you wish to develop your own provider, then you need to create a class that implements the interface `Jhoose.Security.Reporting.IReportingRepository`

You will need to take responsibility for reading the params from the settings and will also need to register the new provider with the IOC container.

``` c#
public interface IReportingRepository
{
    string Type { get; }             // This corresponds to the value you set in the UseProvider setting.

    Task AddReport(ReportTo reportTo);

    Task<DashboardSummary> GetDashboardSummary(DashboardSummary summary);

    Task<int> PurgeReporingData(DateTime beforeDate);

    Task<CspSearchResults> Search(CspSearchParams searchParams);
}
```