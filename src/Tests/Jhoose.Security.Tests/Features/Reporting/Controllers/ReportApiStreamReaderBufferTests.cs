using System;
using System.Buffers;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

using Jhoose.Security.Features.Reporting.Controllers;
using Jhoose.Security.Features.Reporting.Models;

using MyCSharp.HttpUserAgentParser.Providers;

using NUnit.Framework;

namespace Jhoose.Security.Tests.Features.Reporting.Controllers;

// Reproduces the JsonReaderExceptions reported from ReportApiStreamReader.ParseReport, which come from
// how the 16 KB read buffer is filled and bounded rather than from the JSON itself.
public class ReportApiStreamReaderBufferTests
{
    private const int BufferSize = 4096 * 4;
    private const int RefillThreshold = BufferSize / 100 * 90;

    // "Expected end of string, but instead reached end of data. LineNumber: 0 | BytePositionInLine: 16384."
    [Test]
    public async Task ReadAsync_ReportStraddlingBufferBoundary_ReturnsAllReports()
    {
        var reports = Enumerable.Range(0, 10).Select(i => BuildCspReport(i, policyLength: 3000)).ToList();
        var payload = Encoding.UTF8.GetBytes("[" + string.Join(",", reports) + "]");

        // precondition: a report starts before the refill point and ends after the end of the buffer
        var start = 1;
        var straddles = false;
        foreach (var report in reports)
        {
            var end = start + Encoding.UTF8.GetByteCount(report);
            straddles |= start < RefillThreshold && end > BufferSize;
            start = end + 1;
        }
        Assert.That(straddles, Is.True, "payload should have a report crossing the buffer boundary");

        var result = await ReadAsync(payload);

        Assert.That(result.Count, Is.EqualTo(10));
        Assert.That(result.Select(r => r.Message), Is.EqualTo(Enumerable.Range(0, 10).Select(i => $"https://cdn.example.net/{i}.png")));
    }

    // "'0x00' is invalid after a single JSON value. Expected end of data. LineNumber: 3 | BytePositionInLine: 1."
    [Test]
    public async Task ReadAsync_WhitespaceBeforeEndOfArray_ReturnsAllReports()
    {
        var payload = Encoding.UTF8.GetBytes(BuildIndentedPayload(2));

        var result = await ReadAsync(payload, primePool: buffer => Array.Clear(buffer));

        Assert.That(result.Count, Is.EqualTo(2));
    }

    // "'<' is invalid after a single JSON value. Expected end of data. LineNumber: 21 | BytePositionInLine: 76."
    [Test]
    public async Task ReadAsync_StalePooledBuffer_ReturnsAllReports()
    {
        var payload = Encoding.UTF8.GetBytes(BuildIndentedPayload(2));

        // leftover markup from a previous use of the pooled array, e.g. a rendered page
        var result = await ReadAsync(payload, primePool: buffer => Array.Fill(buffer, (byte)'<'));

        Assert.That(result.Count, Is.EqualTo(2));
    }

    // "',' is invalid after a single JSON value. Expected end of data. LineNumber: 81 | BytePositionInLine: 1."
    [Test]
    public async Task ReadAsync_LargeIndentedPayload_ReturnsAllReports()
    {
        var payload = Encoding.UTF8.GetBytes(BuildIndentedPayload(60));
        Assert.That(payload.Length, Is.GreaterThan(BufferSize), "payload should need a refill");

        var result = await ReadAsync(payload, primePool: buffer => Array.Clear(buffer));

        Assert.That(result.Count, Is.EqualTo(60));
    }

    [Test]
    public async Task ReadAsync_WhitespaceBeforeArray_ReturnsAllReports()
    {
        var payload = Encoding.UTF8.GetBytes("\r\n  " + BuildMinifiedPayload(3));

        var result = await ReadAsync(payload);

        Assert.That(result.Count, Is.EqualTo(3));
    }

    [Test]
    public async Task ReadAsync_ByteOrderMarkBeforeArray_ReturnsAllReports()
    {
        var payload = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(BuildMinifiedPayload(3))).ToArray();

        var result = await ReadAsync(payload);

        Assert.That(result.Count, Is.EqualTo(3));
    }

    [Test]
    public async Task ReadAsync_ReportLargerThanBuffer_IsParsed()
    {
        var payload = Encoding.UTF8.GetBytes("[" + BuildCspReport(0, policyLength: 40_000) + "," + BuildCspReport(1, policyLength: 100) + "]");

        var result = await ReadAsync(payload);

        Assert.That(result.Count, Is.EqualTo(2));
        Assert.That((result[0].Body as CspReportToBody)?.OriginalPolicy?.Length, Is.EqualTo(40_000));
        Assert.That(result[1].Message, Is.EqualTo("https://cdn.example.net/1.png"));
    }

    [Test]
    public void ReadAsync_ReportLargerThanLimit_Throws()
    {
        var payload = Encoding.UTF8.GetBytes("[" + BuildCspReport(0, policyLength: 2 * 1024 * 1024) + "]");

        Assert.That(async () => await ReadAsync(payload), Throws.InstanceOf<JsonException>());
    }

    [Test]
    public void ReadAsync_TruncatedPayload_Throws()
    {
        var json = BuildMinifiedPayload(3);
        var payload = Encoding.UTF8.GetBytes(json[..(json.Length - 40)]);

        Assert.That(async () => await ReadAsync(payload), Throws.InstanceOf<JsonException>());
    }

    [TestCase(1)]
    [TestCase(7)]
    [TestCase(4096)]
    public async Task ReadAsync_StreamReturningSmallChunks_ReturnsAllReports(int chunkSize)
    {
        var reports = Enumerable.Range(0, 20).Select(i => BuildCspReport(i, policyLength: 2000));
        var payload = Encoding.UTF8.GetBytes("[" + string.Join(",", reports) + "]");

        var result = await ReadAsync(payload, chunkSize: chunkSize);

        Assert.That(result.Count, Is.EqualTo(20));
        Assert.That(result[19].Message, Is.EqualTo("https://cdn.example.net/19.png"));
    }

    private static async Task<List<ReportTo<IReportToBody>>> ReadAsync(byte[] payload, Action<byte[]>? primePool = null, int? chunkSize = null)
    {
        var reader = new ReportApiStreamReader(new HttpUserAgentParserDefaultProvider());

        // Run off the test thread with a timeout so a parser that never completes fails the test rather than hanging it
        return await Task.Run(async () =>
        {
            if (primePool is not null)
            {
                // ArrayPool.Shared keeps returned arrays in a per thread cache, so the reader's first Rent on
                // this thread gets this array back with whatever it contains
                var buffer = ArrayPool<byte>.Shared.Rent(BufferSize);
                primePool(buffer);
                ArrayPool<byte>.Shared.Return(buffer, clearArray: false);
            }

            await using Stream stream = chunkSize.HasValue ? new ChunkedStream(payload, chunkSize.Value) : new MemoryStream(payload);
            return await reader.ReadAsync(stream, "UnitTestAgent/1.0").ToListAsync();
        }).WaitAsync(TimeSpan.FromSeconds(10));
    }

    private static string BuildCspReport(int i, int policyLength)
    {
        // no quotes, which JsonSerializer would escape
        var policy = new StringBuilder("default-src https:; script-src https:");
        while (policy.Length < policyLength)
            policy.Append(" https://cdn").Append(policy.Length).Append(".example.com");

        return JsonSerializer.Serialize(new
        {
            age = 100 + i,
            body = new
            {
                blockedURL = $"https://cdn.example.net/{i}.png",
                disposition = "enforce",
                documentURL = "https://example.com/",
                effectiveDirective = "img-src",
                originalPolicy = policy.ToString(0, policyLength),
                referrer = string.Empty,
                sample = string.Empty,
                statusCode = 200
            },
            type = "csp-violation",
            url = "https://example.com/",
            user_agent = "Mozilla/5.0"
        });
    }

    private static string BuildMinifiedPayload(int count) =>
        "[" + string.Join(",", Enumerable.Range(0, count).Select(i => BuildCspReport(i, policyLength: 100))) + "]";

    private static string BuildIndentedPayload(int count)
    {
        var reports = JsonSerializer.Deserialize<JsonElement>(BuildMinifiedPayload(count));
        return JsonSerializer.Serialize(reports, new JsonSerializerOptions { WriteIndented = true });
    }

    // Returns at most chunkSize bytes per read, as a network stream can
    private sealed class ChunkedStream(byte[] data, int chunkSize) : MemoryStream(data)
    {
        public override int Read(byte[] buffer, int offset, int count) => base.Read(buffer, offset, Math.Min(count, chunkSize));

        public override Task<int> ReadAsync(byte[] buffer, int offset, int count, CancellationToken cancellationToken) =>
            base.ReadAsync(buffer, offset, Math.Min(count, chunkSize), cancellationToken);

        public override ValueTask<int> ReadAsync(Memory<byte> buffer, CancellationToken cancellationToken = default) =>
            base.ReadAsync(buffer[..Math.Min(buffer.Length, chunkSize)], cancellationToken);
    }
}
