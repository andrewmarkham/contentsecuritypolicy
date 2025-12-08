using System;
using System.Text.Json.Serialization;

namespace Jhoose.Security.Features.Reporting.Models;

public record ReportTo<T> where T : IReportToBody
{
    [JsonConstructor]
    public ReportTo(
        int age,
        string type,
        string url,
        string userAgent,
        T body,
        DateTime recievedAt
    )
    {
        Age = age;
        RecievedAt = recievedAt;
        Type = type;
        Url = url;
        UserAgent = userAgent;
        Body = body;
        Browser = string.Empty;
        Version = string.Empty;
        OS = string.Empty;
    }

    [JsonPropertyName("age")]
    public int Age { get; }

    public DateTime RecievedAt { get; set; }

    [JsonPropertyName("type")]
    public string Type { get; }

    [JsonPropertyName("url")]
    public string Url { get; }

    [JsonPropertyName("user_agent")]
    public string UserAgent { get; set; }
    public string Browser { get; set; }
    public string Version { get; set; }
    public string OS { get; set; }

    public string Directive => Body.Directive ?? string.Empty;

    public string? Message => Body.Message;

    [JsonPropertyName("body")]
    public T Body { get; }
}