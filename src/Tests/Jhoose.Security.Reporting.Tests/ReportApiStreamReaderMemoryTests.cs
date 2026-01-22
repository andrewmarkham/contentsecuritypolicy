using System.Text;
using System.Text.Json;

using Jhoose.Security.Reporting.Controllers;

using MyCSharp.HttpUserAgentParser.Providers;

namespace Jhoose.Security.Reporting.Tests;

public class ReportApiStreamReaderMemoryTests
{
    private const string UserAgent = "UnitTestAgent/1.0";

    [Test]
    public async Task SmallPayload_AllocationIsBounded()
    {
        var parser = new HttpUserAgentParserDefaultProvider();
        var reader = new ReportApiStreamReader(parser);
        var payload = Encoding.UTF8.GetBytes(BuildCspViolationPayload(3));

        await WarmUpAsync(reader, payload);

        var allocated = await MeasureAllocatedBytesAsync(reader, payload);

        Assert.That(allocated, Is.LessThan(160_000), "Small payload should not allocate excessively");
    }

    [Test]
    public async Task LargePayload_RepeatedReads_DoNotLeak()
    {
        var parser = new HttpUserAgentParserDefaultProvider();
        var reader = new ReportApiStreamReader(parser);
        var payload = Encoding.UTF8.GetBytes(BuildCspViolationPayload(120));

        await WarmUpAsync(reader, payload);

        GC.Collect();
        GC.WaitForPendingFinalizers();
        GC.Collect();

        var before = GC.GetTotalMemory(true);

        for (var i = 0; i < 25; i++)
        {
            await using var stream = new MemoryStream(payload);
            var result = await reader.ReadAsync(stream, UserAgent).ToListAsync();
            Assert.That(result.Count, Is.EqualTo(120));
        }

        GC.Collect();
        GC.WaitForPendingFinalizers();
        GC.Collect();

        var after = GC.GetTotalMemory(true);
        var delta = Math.Max(after - before, 0);

        Assert.That(delta, Is.LessThan(2_000_000), "Repeated parsing should not retain significant memory");
    }

    private static async Task WarmUpAsync(ReportApiStreamReader reader, byte[] payload)
    {
        await using var stream = new MemoryStream(payload);
        await reader.ReadAsync(stream, UserAgent).ToListAsync();
    }

    private static async Task<long> MeasureAllocatedBytesAsync(ReportApiStreamReader reader, byte[] payload)
    {
        var before = GC.GetAllocatedBytesForCurrentThread();

        await using var stream = new MemoryStream(payload);
        var result = await reader.ReadAsync(stream, UserAgent).ToListAsync();

        Assert.That(result.Count, Is.GreaterThan(0));

        var after = GC.GetAllocatedBytesForCurrentThread();
        return after - before;
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
