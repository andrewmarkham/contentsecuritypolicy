

using System.Text;
using System.Text.Json;

using BenchmarkDotNet.Attributes;

using Jhoose.Security.Reporting.Controllers;
using Jhoose.Security.Reporting.Models;

using Microsoft.IO;

using MyCSharp.HttpUserAgentParser.Providers;

[MemoryDiagnoser]
public class ProblemJsonFormatterBenchmark
{
    private const string UserAgent = "UnitTestAgent/1.0";
    private RecyclableMemoryStreamManager _memoryStreamManager = new RecyclableMemoryStreamManager();

    private static readonly HttpUserAgentParserDefaultProvider parser = new();
    private static readonly string payload = BuildCspViolationPayload(50);
    private static byte[] bytes = Encoding.UTF8.GetBytes(payload);

    [Benchmark(Baseline = true)]
    public async Task<bool> ReportApiStreamReaderBenchmarkLegacy()
    {
        var reader = new ReportApiStreamReaderLegacy(parser);

        for (var i = 0; i < 200; i++)
        {
            await using var stream = _memoryStreamManager.GetStream(bytes);
            var result = await reader.ReadAsync(stream, UserAgent);;
        }

        return true;
    }

    [Benchmark]
    public async Task<bool> ReportApiStreamReaderBenchmark()
    {
        var reader = new ReportApiStreamReader(parser);

        for (var i = 0; i < 200; i++)
        {
            await using var stream = _memoryStreamManager.GetStream(bytes);
            var result = await reader.ReadAsync(stream, UserAgent).ToListAsync();
        }

        return true;
    }

        [Benchmark]
    public async Task<bool> NativeSerializationBenchmark()
    {
        var reader = new ReportApiStreamReader(parser);

        for (var i = 0; i < 200; i++)
        {
            await using var stream = _memoryStreamManager.GetStream(bytes);
            var result = await System.Text.Json.JsonSerializer.DeserializeAsync<List<ReportTo<CspReportToBody>>>(stream);
        }

        return true;
    }
    private static string BuildCspViolationPayload(int count)
    {
        var reports = Enumerable.Range(0, count).Select(i => new
        {
            age = 100 + i,
            body = new
            {
                blockedURL = $"https://example.test/block/{i}",
                disposition = "report",
                documentURL = "https://example.test/",
                effectiveDirective = "script-src",
                originalPolicy = "default-src 'none'; report-to csp-endpoint;",
                referrer = string.Empty,
                sample = string.Empty,
                statusCode = 200
            },
            type = "csp-violation",
            url = "https://example.test/",
            user_agent = UserAgent
        });

        return JsonSerializer.Serialize(reports);
    }

}