using System.Text;

using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

using MyCSharp.HttpUserAgentParser.Providers;

namespace Jhoose.Security.Reporting.Controllers;

public class ProblemJsonFormatter : TextInputFormatter
{
    public ProblemJsonFormatter()
    {

        this.SupportedMediaTypes.Add(new Microsoft.Net.Http.Headers.MediaTypeHeaderValue("application/problem+json"));
        this.SupportedMediaTypes.Add(new Microsoft.Net.Http.Headers.MediaTypeHeaderValue("application/reports+json"));
        this.SupportedMediaTypes.Add(new Microsoft.Net.Http.Headers.MediaTypeHeaderValue("application/csp-report"));
        this.SupportedEncodings.Add(Encoding.UTF8);
        this.SupportedEncodings.Add(Encoding.Unicode);
    }

    public override async Task<InputFormatterResult> ReadRequestBodyAsync(InputFormatterContext context, Encoding effectiveEncoding)
    {
        var httpContext = context.HttpContext;
        var serviceProvider = httpContext.RequestServices;

        var logger = serviceProvider.GetRequiredService<ILogger<ProblemJsonFormatter>>();
        var parser = serviceProvider.GetRequiredService<IHttpUserAgentParserProvider>();

        using var reader = new StreamReader(httpContext.Request.Body, encoding: Encoding.UTF8);

        try
        {
            context.HttpContext.Request.Headers.TryGetValue("User-Agent", out var userAgent);

            var apiStreamReader = new ReportApiStreamReader(parser);
            var reports = await apiStreamReader.ReadAsync(httpContext.Request.Body, userAgent.ToString() ?? string.Empty);
            /*
                            json = await reader.ReadToEndAsync();

                            try
                            {
                                if (json.Contains("csp-report"))
                                {
                                    var reportUri = JsonSerializer.Deserialize<ReportUri>(json);
                                    if (reportUri == null)
                                    {
                                        logger.LogError("Read failed: reportUri = null");
                                        return await InputFormatterResult.FailureAsync();
                                    }

                                    var rt = new ReportTo(0, "csp-violation", reportUri.CspReport.DocumentUri, userAgent.ToString() ?? string.Empty, new ReportToBody(reportUri.CspReport), DateTime.UtcNow);
                                    reportTo.Add(rt);
                                }
                                else if (json.Contains("permissions-policy-violation"))
                                {
                                    if (json.StartsWith("[") && json.EndsWith("]"))
                                    {
                                        var rtc = JsonSerializer.Deserialize<List<ReportTo>>(json) ?? [];
                                        reportTo.AddRange(rtc);
                                    }
                                    else
                                    {
                                        var rt = JsonSerializer.Deserialize<ReportTo>(json);
                                        if (rt is not null)
                                        {
                                            reportTo.Add(rt);
                                        }
                                    }
                                    foreach (var r in reportTo)
                                    {
                                        r.RecievedAt = DateTime.UtcNow;
                                        r.UserAgent = userAgent.ToString() ?? string.Empty;
                                    }
                                }
                                else
                                {
                                    if (json.StartsWith("[") && json.EndsWith("]"))
                                    {
                                        var rtc = JsonSerializer.Deserialize<List<ReportTo>>(json) ?? [];
                                        reportTo.AddRange(rtc);
                                    }
                                    else
                                    {
                                        var rt = JsonSerializer.Deserialize<ReportTo>(json);
                                        if (rt is not null)
                                        {
                                            reportTo.Add(rt);
                                        }
                                    }
                                    foreach (var r in reportTo)
                                    {
                                        r.RecievedAt = DateTime.UtcNow;
                                        r.UserAgent = userAgent.ToString() ?? string.Empty;
                                    }
                                }

                                var userAgentInfo = parser.Parse(userAgent.ToString() ?? string.Empty);

                                foreach (var r in reportTo)
                                {
                                    r.Browser = userAgentInfo.Name ?? string.Empty;
                                    r.Version = userAgentInfo.Version ?? string.Empty;
                                    r.OS = userAgentInfo.Platform?.Name ?? string.Empty;
                                }
                            }
                            catch (Exception ex)
                            {
                                logger.LogError(ex, "Read failed: json = {json}", json);
                                return await InputFormatterResult.FailureAsync();
                            }

            */
            return await InputFormatterResult.SuccessAsync(reports.ToList());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Read report api failed");
            return await InputFormatterResult.FailureAsync();
        }
    }
}
