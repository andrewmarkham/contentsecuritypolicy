using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Jhoose.Security.Features.Reporting.Controllers;
using Jhoose.Security.Features.Reporting.Models;

using MyCSharp.HttpUserAgentParser.Providers;

using NUnit.Framework;

namespace Jhoose.Security.Tests.Features.Reporting.Controllers;

public class ReportApiStreamReaderReportTypeTests
{
    [Test]
    public async Task ReadAsync_PotentialPermissionsPolicyViolation_IsStoredSeparately()
    {
        var json = """
        [{"age":0,"type":"csp-violation","url":"https://example.com/","user_agent":"Mozilla/5.0","body":{"documentURL":"https://example.com/","effectiveDirective":"img-src","blockedURL":"https://cdn.example.net/a.png","disposition":"enforce"}},
         {"age":0,"type":"potential-permissions-policy-violation","url":"https://example.com/","user_agent":"Mozilla/5.0","body":{"allowAttribute":"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share","columnNumber":234,"disposition":"enforce","lineNumber":148,"message":"Potential permissions policy violation: accelerometer is not allowed in this document.","policyId":"accelerometer","sourceFile":"https://player.example.org/js/widget-api.js"}}]
        """;

        var result = await ReadAsync(json);

        Assert.That(result.Count, Is.EqualTo(2));

        Assert.That(result[0].Type, Is.EqualTo("csp-violation"));
        Assert.That(result[0].Directive, Is.EqualTo("img-src"));

        Assert.That(result[1].Type, Is.EqualTo("potential-permissions-policy"));
        Assert.That(result[1].Directive, Is.EqualTo("accelerometer"));

        var body = result[1].Body as PermissionsReportToBody;
        Assert.That(body, Is.Not.Null);
        Assert.That(body!.AllowAttribute, Does.StartWith("accelerometer; autoplay"));
        Assert.That(body.SourceFile, Is.EqualTo("https://player.example.org/js/widget-api.js"));
        Assert.That(body.LineNumber, Is.EqualTo(148));
        Assert.That(body.ColumnNumber, Is.EqualTo(234));
    }

    [Test]
    public async Task ReadAsync_PermissionsPolicyViolation_DoesNotCaptureAllowAttribute()
    {
        var json = """
        [{"age":0,"type":"permissions-policy-violation","url":"https://example.com/","user_agent":"Mozilla/5.0","body":{"allowAttribute":"camera","disposition":"enforce","message":"camera is not allowed","policyId":"camera"}}]
        """;

        var result = await ReadAsync(json);

        var body = result.Single().Body as PermissionsReportToBody;
        Assert.That(body, Is.Not.Null);
        Assert.That(body!.AllowAttribute, Is.Null);
    }

    [Test]
    public async Task ReadAsync_PermissionsPolicyViolation_ExplainerFieldNames()
    {
        var json = """
        [{
            "type": "permissions-policy-violation",
            "url": "https://a.featurepolicy.rocks/geolocation.html",
            "age": 60000,
            "user_agent": "Mozilla/5.0",
            "body": {
                "featureId": "geolocation",
                "message": "Geolocation access has been blocked because of a policy applied to the current document.",
                "source_file": "https://a.featurepolicy.rocks/geolocation.html",
                "line_number": 20,
                "column_number": 37,
                "disposition": "enforce"
            }
        }]
        """;

        var result = await ReadAsync(json);

        var report = result.Single();
        Assert.That(report.Directive, Is.EqualTo("geolocation"));

        var body = report.Body as PermissionsReportToBody;
        Assert.That(body, Is.Not.Null);
        Assert.That(body!.SourceFile, Is.EqualTo("https://a.featurepolicy.rocks/geolocation.html"));
        Assert.That(body.LineNumber, Is.EqualTo(20));
        Assert.That(body.ColumnNumber, Is.EqualTo(37));
    }

    [Test]
    public async Task ReadAsync_Intervention_SpecExample()
    {
        var json = """
        [{
            "type": "intervention",
            "age": 27,
            "url": "https://example.com/",
            "user_agent": "Mozilla/5.0",
            "body": {
                "id": "audio-no-gesture",
                "message": "A request to play audio was blocked because it was not triggered by user activation (such as a click).",
                "sourceFile": "https://example.com/index.js",
                "lineNumber": 1234,
                "columnNumber": 42
            }
        },
        {
            "type": "intervention",
            "age": 27,
            "url": "https://example.com/",
            "user_agent": "Mozilla/5.0",
            "body": {
                "id": "audio-no-gesture",
                "message": "A request to play audio was blocked.",
                "sourceFile": null,
                "lineNumber": null,
                "columnNumber": null
            }
        }]
        """;

        var result = await ReadAsync(json);

        Assert.That(result.Count, Is.EqualTo(2));

        Assert.That(result[0].Type, Is.EqualTo("intervention"));
        Assert.That(result[0].Directive, Is.EqualTo("audio-no-gesture"));
        Assert.That(result[0].Message, Does.StartWith("A request to play audio was blocked"));

        var body = result[0].Body as InterventionReportToBody;
        Assert.That(body, Is.Not.Null);
        Assert.That(body!.SourceFile, Is.EqualTo("https://example.com/index.js"));
        Assert.That(body.LineNumber, Is.EqualTo(1234));
        Assert.That(body.ColumnNumber, Is.EqualTo(42));

        var nullBody = result[1].Body as InterventionReportToBody;
        Assert.That(nullBody, Is.Not.Null);
        Assert.That(nullBody!.SourceFile, Is.Null);
        Assert.That(nullBody.LineNumber, Is.Null);
        Assert.That(nullBody.ColumnNumber, Is.Null);
    }

    [Test]
    public async Task ReadAsync_BodyContainingClosingBrace_ParsesFollowingReport()
    {
        var json = """
        [{"age":0,"type":"intervention","url":"https://example.com/","user_agent":"Mozilla/5.0","body":{"message":"Blocked {something} here","id":"some-intervention","lineNumber":5}},
         {"age":0,"type":"csp-violation","url":"https://example.com/","user_agent":"Mozilla/5.0","body":{"effectiveDirective":"img-src","blockedURL":"https://cdn.example.net/a.png"}}]
        """;

        var result = await ReadAsync(json);

        Assert.That(result.Count, Is.EqualTo(2));
        Assert.That(result[0].Directive, Is.EqualTo("some-intervention"));
        Assert.That(result[0].Message, Is.EqualTo("Blocked {something} here"));
        Assert.That((result[0].Body as InterventionReportToBody)?.LineNumber, Is.EqualTo(5));
        Assert.That(result[1].Directive, Is.EqualTo("img-src"));
    }

    [Test]
    public async Task ReadAsync_Crash_IsUnknownWithoutBody()
    {
        var json = """
        [{
            "type": "crash",
            "age": 42,
            "url": "https://example.com/",
            "user_agent": "Mozilla/5.0",
            "body": {
                "reason": "oom",
                "is_top_level": true,
                "crash_report_api": { "k": "v" },
                "visibility_state": "visible"
            }
        },
        {"age":0,"type":"csp-violation","url":"https://example.com/","user_agent":"Mozilla/5.0","body":{"effectiveDirective":"img-src","blockedURL":"https://cdn.example.net/a.png"}}]
        """;

        var result = await ReadAsync(json);

        Assert.That(result.Count, Is.EqualTo(2));
        Assert.That(result[0].Type, Is.EqualTo("unknown"));
        Assert.That(result[0].Body, Is.Null);
        Assert.That(result[0].Directive, Is.Null);
        Assert.That(result[1].Type, Is.EqualTo("csp-violation"));
        Assert.That(result[1].Directive, Is.EqualTo("img-src"));
    }

    [Test]
    public async Task ReadAsync_FireFoxJson_ViolatedDirectiveOnly()
    {
        var json = """
        {
            "csp-report": {
                "blocked-uri": "inline",
                "document-uri": "https://example.com/",
                "original-policy": "script-src 'self'",
                "referrer": "",
                "script-sample": "alert(1)",
                "status-code": 200,
                "violated-directive": "script-src"
            }
        }
        """;

        var result = await ReadAsync(json);

        var report = result.Single();
        Assert.That(report.Type, Is.EqualTo("csp-violation"));
        Assert.That(report.Directive, Is.EqualTo("script-src"));
        Assert.That((report.Body as CspReportToBody)?.Sample, Is.EqualTo("alert(1)"));
    }

    [Test]
    public async Task ReadAsync_EscapedValues_AreUnescaped()
    {
        var json = """
        [{"age":0,"type":"csp-violation","url":"https:\/\/example.com\/page","user_agent":"Mozilla/5.0","body":{"documentURL":"https:\/\/example.com\/page","effectiveDirective":"script-src","blockedURL":"inline","originalPolicy":"script-src 'self'","sample":"alert(\"hi\")","disposition":"enforce"}}]
        """;

        var result = await ReadAsync(json);

        var report = result.Single();
        Assert.That(report.Url, Is.EqualTo("https://example.com/page"));

        var body = report.Body as CspReportToBody;
        Assert.That(body, Is.Not.Null);
        Assert.That(body!.DocumentURL, Is.EqualTo("https://example.com/page"));
        Assert.That(body.OriginalPolicy, Is.EqualTo("script-src 'self'"));
        Assert.That(body.Sample, Is.EqualTo("alert(\"hi\")"));
        Assert.That(body.EffectiveDirective, Is.EqualTo("script-src"));
    }

    [Test]
    public async Task ReadAsync_FireFoxJson_EscapedValues_AreUnescaped()
    {
        var json = """
        {"csp-report":{"blocked-uri":"https:\/\/cdn.example.net\/a.js","document-uri":"https:\/\/example.com\/","original-policy":"script-src 'self'","violated-directive":"script-src"}}
        """;

        var result = await ReadAsync(json);

        var report = result.Single();
        Assert.That(report.Url, Is.EqualTo("https://example.com/"));
        Assert.That(report.Message, Is.EqualTo("https://cdn.example.net/a.js"));
        Assert.That((report.Body as CspReportToBody)?.OriginalPolicy, Is.EqualTo("script-src 'self'"));
    }

    private static async Task<List<ReportTo<IReportToBody>>> ReadAsync(string json)
    {
        var reader = new ReportApiStreamReader(new HttpUserAgentParserDefaultProvider());

        // Run off the test thread with a timeout so a parser that never completes fails the test rather than hanging it
        return await Task.Run(async () =>
        {
            await using var stream = new MemoryStream(Encoding.UTF8.GetBytes(json));
            return await reader.ReadAsync(stream, "UnitTestAgent/1.0").ToListAsync();
        }).WaitAsync(TimeSpan.FromSeconds(10));
    }
}
