using System.IO;
using System.Text;
using System.Threading.Tasks;

using Jhoose.Security.Features.Reporting.Controllers;

using MyCSharp.HttpUserAgentParser.Providers;

using NUnit.Framework;

namespace Jhoose.Security.Tests;

public class ReportApiStreamReaderTests
{
    [Test]
    public async Task ReadAsync_SmallJson()
    {
        var json = """
        [
            {
                "age": 29160,
                "body": {
                    "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "img-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 12025,
                "body": {
                    "columnNumber": 53,
                    "disposition": "enforce",
                    "lineNumber": 1021,
                    "message": "Permissions policy violation: camera is not allowed in this document.",
                    "policyId": "camera",
                    "sourceFile": "https://localhost:5001/"
                },
                "type": "permissions-policy-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 17955,
                "body": {
                    "columnNumber": 20,
                    "id": "UnloadHandler",
                    "lineNumber": 17,
                    "message": "Unload event listeners are deprecated and will be removed.",
                    "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
                },
                "type": "deprecation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            }
        ]
        """;

        var p = new HttpUserAgentParserDefaultProvider();

        await using var stream = new MemoryStream(Encoding.UTF8.GetBytes(json));
        var reader = new ReportApiStreamReader(p);

        var result = await reader.ReadAsync(stream, "UnitTestAgent/1.0");

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Count, Is.EqualTo(3));
    }

    [Test]
    public async Task ReadAsync_LargeJson()
    {
        var json = """
        [
            {
                "age": 29165,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/thasadith/v13/mtG44_1TIqPYrd_f5R1oo0MV8ia-FnZE.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45557,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 949,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45557,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 948,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45557,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 946,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45556,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "script-src-elem",
                    "lineNumber": 1009,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45556,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 992,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45557,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-elem",
                    "lineNumber": 975,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45557,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 963,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45555,
                "body": {
                    "blockedURL": "https://qbjtyv.files.cmp.optimizely.com/download/a291a1e2544811efb3ad6e92bdbee51a",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "media-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45556,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 1068,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45556,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-elem",
                    "lineNumber": 1062,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29164,
                "body": {
                    "blockedURL": "https://localhost:5001/js/2285773e6b4b172f07d9.woff",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29164,
                "body": {
                    "blockedURL": "https://localhost:5001/js/eeccf4f66002c6f2ba24.woff",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29164,
                "body": {
                    "blockedURL": "https://localhost:5001/js/1551f4f60c37af51121f.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29165,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/thasadith/v13/mtG44_1TIqPYrd_f5R1ouEMV8ia-FnZE.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29164,
                "body": {
                    "blockedURL": "https://localhost:5001/js/be9ee23c0c6390141475.ttf",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29164,
                "body": {
                    "blockedURL": "https://localhost:5001/js/bb58e57c48a3e911f15f.woff",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29164,
                "body": {
                    "blockedURL": "https://localhost:5001/js/7a3337626410ca2f4071.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29164,
                "body": {
                    "blockedURL": "https://localhost:5001/js/527940b104eb2ea366c8.ttf",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29164,
                "body": {
                    "blockedURL": "https://localhost:5001/js/491974d108fe4002b2aa.ttf",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45560,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 620,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45559,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 786,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45560,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 608,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45560,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 597,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45559,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 787,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 11961,
                "body": {
                    "blockedURL": "https://localhost:5001/icons/episerver.png",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "img-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 11973,
                "body": {
                    "blockedURL": "https://localhost:5001/Util/images/brand-logo-white.svg",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "img-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29179,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/roboto/v49/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3-UBHMdazTgWw.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45561,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 57,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29165,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_v86KnvOitk7IfqZUQ.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29168,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/roboto/v49/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3OUBHMdazTgWw.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29165,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_v86KnTOitk7Ifo.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45560,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 206,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29165,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/thasadith/v13/mtG44_1TIqPYrd_f5R1ot0MV8ia-Fg.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29165,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/thasadith/v13/mtG44_1TIqPYrd_f5R1ouUMV8ia-FnZE.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29159,
                "body": {
                    "blockedURL": "https://images1.cmp.optimizely.com/Zz1jZWZhYTZjMDU0NDgxMWVmYWYyODVlN2M1NzExM2FkNA==",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "img-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45561,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 54,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45560,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 218,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45560,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 780,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29165,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_v86KnrOitk7IfqZUQ.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29165,
                "body": {
                    "blockedURL": "https://localhost:5001/js/d878b0a6a1144760244f.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29165,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXp-obK4.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29168,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/roboto/v49/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3KUBHMdazTgWw.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29165,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw3aXp-obK4ALg.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29179,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/roboto/v49/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3CUBHMdazTgWw.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29164,
                "body": {
                    "blockedURL": "data",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29164,
                "body": {
                    "blockedURL": "https://localhost:5001/Util/styles/Inter-italic.var.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29179,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/roboto/v49/KFO5CnqEu92Fr1Mu53ZEC9_Vu3r1gIhOszmkCHkaSTbQWt4N.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29179,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/roboto/v49/KFO5CnqEu92Fr1Mu53ZEC9_Vu3r1gIhOszmkCXkaSTbQWt4N.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29179,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/roboto/v49/KFO5CnqEu92Fr1Mu53ZEC9_Vu3r1gIhOszmkenkaSTbQWt4N.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29179,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/roboto/v49/KFO5CnqEu92Fr1Mu53ZEC9_Vu3r1gIhOszmkBXkaSTbQWt4N.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29181,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/roboto/v49/KFO5CnqEu92Fr1Mu53ZEC9_Vu3r1gIhOszmkC3kaSTbQWt4N.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29179,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/roboto/v49/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3iUBHMdazTgWw.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29179,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/roboto/v49/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3GUBHMdazTgWw.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29179,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/roboto/v49/KFO5CnqEu92Fr1Mu53ZEC9_Vu3r1gIhOszmkBnkaSTbQWg.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29161,
                "body": {
                    "blockedURL": "https://images2.cmp.optimizely.com/Zz1kMDcwNDNkNDU0NDgxMWVmOGEzMWUyNzgyODUwNDI1OQ==",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "img-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29164,
                "body": {
                    "blockedURL": "https://localhost:5001/Util/styles/Inter-roman.var.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45561,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 177,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29179,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/roboto/v49/KFO5CnqEu92Fr1Mu53ZEC9_Vu3r1gIhOszmkCnkaSTbQWt4N.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29180,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/roboto/v49/KFO5CnqEu92Fr1Mu53ZEC9_Vu3r1gIhOszmkAnkaSTbQWt4N.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29179,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/roboto/v49/KFO5CnqEu92Fr1Mu53ZEC9_Vu3r1gIhOszmkaHkaSTbQWt4N.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29165,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw0aXp-obK4ALg.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29165,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_v86KnDOitk7IfqZUQ.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29165,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw2aXp-obK4ALg.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29165,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw9aXp-obK4ALg.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29165,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_v86KnnOitk7IfqZUQ.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29168,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/roboto/v49/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3yUBHMdazQ.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45561,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-elem",
                    "lineNumber": 179,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29169,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/roboto/v49/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMawCUBHMdazTgWw.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29169,
                "body": {
                    "blockedURL": "https://fonts.gstatic.com/s/roboto/v49/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMaxKUBHMdazTgWw.woff2",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "font-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 12042,
                "body": {
                    "blockedURL": "inline",
                    "columnNumber": 37,
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 34299,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/js/main.min.js",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45561,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 53,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45559,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-elem",
                    "lineNumber": 814,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45559,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 802,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45559,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 799,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45559,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 871,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45559,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 856,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45559,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 854,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45559,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 835,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45559,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 887,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45559,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 885,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45559,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 874,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45559,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 873,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45558,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 896,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45558,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 892,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45559,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 891,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45559,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 889,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45558,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 940,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45558,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-elem",
                    "lineNumber": 919,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45558,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 907,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45560,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 784,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45560,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 782,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45559,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 833,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45558,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 904,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 45557,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "style-src-attr",
                    "lineNumber": 960,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 12035,
                "body": {
                    "blockedURL": "inline",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "script-src-elem",
                    "lineNumber": 1148,
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "sourceFile": "https://localhost:5001/",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29160,
                "body": {
                    "blockedURL": "https://images1.cmp.optimizely.com/Zz1iMjYyZWQyNDU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "img-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 11972,
                "body": {
                    "blockedURL": "https://localhost:5001/Util/images/quicknav/quicknav-arrow.png",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "img-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 29160,
                "body": {
                    "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
                    "disposition": "report",
                    "documentURL": "https://localhost:5001/",
                    "effectiveDirective": "img-src",
                    "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
                    "referrer": "",
                    "sample": "",
                    "statusCode": 200
                },
                "type": "csp-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
            {
                "age": 12025,
                "body": {
                    "columnNumber": 53,
                    "disposition": "enforce",
                    "lineNumber": 1021,
                    "message": "Permissions policy violation: camera is not allowed in this document.",
                    "policyId": "camera",
                    "sourceFile": "https://localhost:5001/"
                },
                "type": "permissions-policy-violation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            },
                {
                "age": 17955,
                "body": {
                    "columnNumber": 20,
                    "id": "UnloadHandler",
                    "lineNumber": 17,
                    "message": "Unload event listeners are deprecated and will be removed.",
                    "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
                },
                "type": "deprecation",
                "url": "https://localhost:5001/",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            }
        ]
        """;

        var p = new HttpUserAgentParserDefaultProvider();

        await using var stream = new MemoryStream(Encoding.UTF8.GetBytes(json));
        var reader = new ReportApiStreamReader(p);

        var result = await reader.ReadAsync(stream, "UnitTestAgent/1.0");

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Count, Is.EqualTo(101));
    }

        [Test]
    public async Task ReadAsync_FireFoxJson()
    {
        var json = """
        {
            "csp-report": {
                "blocked-uri": "data",
                "disposition": "enforce",
                "document-uri": "https://survey.example.net/",
                "effective-directive": "media-src",
                "original-policy": "default-src 'none'; base-uri 'none'; form-action 'self'; script-src 'self'; img-src 'self'; style-src 'self'; connect-src 'self' https://forum.example.net/; frame-ancestors 'none'; report-uri https://login.example.net/csp",
                "referrer": "",
                "status-code": 200,
                "violated-directive": "media-src"
            }
        }
        """;

        var p = new HttpUserAgentParserDefaultProvider();

        await using var stream = new MemoryStream(Encoding.UTF8.GetBytes(json));
        var reader = new ReportApiStreamReader(p);

        var result = await reader.ReadAsync(stream, "UnitTestAgent/1.0");

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Count, Is.EqualTo(1));
    }
}
