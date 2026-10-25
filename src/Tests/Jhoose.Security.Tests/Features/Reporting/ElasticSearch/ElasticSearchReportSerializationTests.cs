using System;
using System.IO;
using System.Text;

using Elastic.Clients.Elasticsearch;

using Jhoose.Security.Features.Reporting.Models;

using NUnit.Framework;

namespace Jhoose.Security.Tests.Features.Reporting.ElasticSearch;

// The Elasticsearch repository indexes ReportTo documents with the client's source serializer and reads
// the body back through the IReportToBody type discriminator, so each body type has to round trip.
public class ElasticSearchReportSerializationTests
{
    [Test]
    public void Intervention_RoundTrips()
    {
        var report = new ReportTo<IReportToBody>(27, "intervention", "https://example.com/", "Mozilla/5.0",
            new InterventionReportToBody("audio-no-gesture", 1234, 42, "A request to play audio was blocked.", "https://example.com/index.js"),
            DateTime.UtcNow);

        var (json, result) = RoundTrip(report);

        Assert.That(json, Does.Contain("\"intervention\""));
        Assert.That(result.Directive, Is.EqualTo("audio-no-gesture"));
        Assert.That(result.Message, Is.EqualTo("A request to play audio was blocked."));

        var body = result.Body as InterventionReportToBody;
        Assert.That(body, Is.Not.Null);
        Assert.That(body!.SourceFile, Is.EqualTo("https://example.com/index.js"));
        Assert.That(body.LineNumber, Is.EqualTo(1234));
        Assert.That(body.ColumnNumber, Is.EqualTo(42));
    }

    [Test]
    public void PotentialPermissionsPolicy_RoundTripsAllowAttribute()
    {
        var report = new ReportTo<IReportToBody>(0, "potential-permissions-policy", "https://example.com/", "Mozilla/5.0",
            new PermissionsReportToBody("enforce", "accelerometer", "Potential permissions policy violation", "https://player.example.org/js/widget-api.js", 148, 234, "accelerometer; autoplay"),
            DateTime.UtcNow);

        var (_, result) = RoundTrip(report);

        Assert.That(result.Type, Is.EqualTo("potential-permissions-policy"));
        Assert.That(result.Directive, Is.EqualTo("accelerometer"));

        var body = result.Body as PermissionsReportToBody;
        Assert.That(body, Is.Not.Null);
        Assert.That(body!.AllowAttribute, Is.EqualTo("accelerometer; autoplay"));
    }

    [Test]
    public void PermissionsPolicy_OmitsAllowAttribute()
    {
        var report = new ReportTo<IReportToBody>(0, "permissions-policy-violation", "https://example.com/", "Mozilla/5.0",
            new PermissionsReportToBody("enforce", "camera", "camera is not allowed", null, null, null),
            DateTime.UtcNow);

        var (json, result) = RoundTrip(report);

        Assert.That(json, Does.Not.Contain("allowAttribute"));
        Assert.That((result.Body as PermissionsReportToBody)?.AllowAttribute, Is.Null);
    }

    [Test]
    public void ExistingPermissionsDocument_WithoutAllowAttribute_Deserializes()
    {
        // shape of a document indexed before allowAttribute was added
        var json = """
        {"age":0,"type":"permissions-policy-violation","url":"https://example.com/","user_agent":"Mozilla/5.0",
         "body":{"type":"permissions","disposition":"enforce","policyId":"camera","message":"camera is not allowed","sourceFile":null,"lineNumber":1,"columnNumber":2},
         "recievedAt":"2026-01-01T00:00:00Z","directive":"camera","message":"camera is not allowed"}
        """;

        var result = Deserialize(json);

        var body = result.Body as PermissionsReportToBody;
        Assert.That(body, Is.Not.Null);
        Assert.That(body!.PolicyId, Is.EqualTo("camera"));
        Assert.That(body.AllowAttribute, Is.Null);
    }

    private static (string json, ReportTo<IReportToBody> result) RoundTrip(ReportTo<IReportToBody> report)
    {
        var serializer = new ElasticsearchClientSettings(new Uri("http://localhost:9200")).SourceSerializer;

        using var stream = new MemoryStream();
        serializer.Serialize(report, stream);

        var json = Encoding.UTF8.GetString(stream.ToArray());
        return (json, Deserialize(json));
    }

    private static ReportTo<IReportToBody> Deserialize(string json)
    {
        var serializer = new ElasticsearchClientSettings(new Uri("http://localhost:9200")).SourceSerializer;

        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(json));
        return serializer.Deserialize<ReportTo<IReportToBody>>(stream)!;
    }
}
