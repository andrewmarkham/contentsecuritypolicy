using System.Text;
using System.Text.Json;
using Jhoose.Security.Reporting.Models;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MyCSharp.HttpUserAgentParser.Providers;

namespace Jhoose.Security.Reporting.Controllers
{
    public class ProblemJsonFormatter : TextInputFormatter
    {
        public ProblemJsonFormatter()
        {
            
            this.SupportedMediaTypes.Add(new Microsoft.Net.Http.Headers.MediaTypeHeaderValue("application/problem+json"));
            this.SupportedMediaTypes.Add(new Microsoft.Net.Http.Headers.MediaTypeHeaderValue("application/reports+json"));
            this.SupportedMediaTypes.Add(new Microsoft.Net.Http.Headers.MediaTypeHeaderValue("application/csp-report"));
            this.SupportedEncodings.Add(Encoding.UTF8);
        }

        public override async Task<InputFormatterResult> ReadRequestBodyAsync(InputFormatterContext context, Encoding effectiveEncoding)
        {
            ReportTo? reportTo;
            string? json = null;

            var httpContext = context.HttpContext;
            var serviceProvider = httpContext.RequestServices;

            var logger = serviceProvider.GetRequiredService<ILogger<ProblemJsonFormatter>>();
            var parser = serviceProvider.GetRequiredService<IHttpUserAgentParserProvider>();

            using var reader = new StreamReader(httpContext.Request.Body, effectiveEncoding);

            try
            {
                context.HttpContext.Request.Headers.TryGetValue("User-Agent", out var userAgent);

                json = await reader.ReadToEndAsync();

                if (json.Contains("csp-report"))
                {
                    var reportUri = JsonSerializer.Deserialize<ReportUri>(json);
                    if (reportUri == null)
                    {
                        logger.LogError("Read failed: reportUri = null");
                        return await InputFormatterResult.FailureAsync();
                    }

                    reportTo = new ReportTo(0, "csp-violation", reportUri.CspReport.DocumentUri, userAgent.ToString() ?? string.Empty, new ReportToBody(reportUri.CspReport), DateTime.UtcNow);
                }
                else
                {
                    reportTo = JsonSerializer.Deserialize<ReportTo>(json);
                    if (reportTo == null)
                    {
                        logger.LogError("Read failed: reportTo = null");
                        return await InputFormatterResult.FailureAsync();
                    }
                    reportTo.RecievedAt = DateTime.UtcNow;
                    reportTo.UserAgent = userAgent.ToString() ?? string.Empty;
                }

                var userAgentInfo = parser.Parse(reportTo.UserAgent);
                reportTo.Browser = userAgentInfo.Name ?? string.Empty;
                reportTo.Version = userAgentInfo.Version ?? string.Empty;
                reportTo.OS = userAgentInfo.Platform?.Name ?? string.Empty;

                return await InputFormatterResult.SuccessAsync(reportTo);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Read failed: json = {json}",json);
                return await InputFormatterResult.FailureAsync();
            }
        }
    }
}