using System;
using System.Text.Json.Serialization;

namespace Jhoose.Security.Features.Reporting.Models;

public sealed class ReportTo<T> where T : IReportToBody
{
    [JsonConstructor]
    public ReportTo(int age, string type, string url, string userAgent, T? body, DateTime recievedAt)
        => (Age, Type, Url, UserAgent, Body, RecievedAt) = (age, type, url, userAgent, body, recievedAt);

    [JsonPropertyName("age")] public int Age { get; }
    [JsonPropertyName("type")] public string Type { get; }
    [JsonPropertyName("url")] public string Url { get; }
    [JsonPropertyName("user_agent")] public string UserAgent { get; }
    [JsonPropertyName("body")] public T? Body { get; }
    public DateTime RecievedAt { get; }

    // Optional enrichment: only set when you have real values
    public string? Browser { get; set; }
    public string? Version { get; set; }
    public string? OS { get; set; }

    // Avoid forcing empty strings; let null mean “missing”
    public string? Directive => Body?.Directive;
    public string? Message => Body?.Message;
}