using System.Text;
using System.Text.Json;
using Jhoose.Security.Reporting.Models;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

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

                    reportTo = new ReportTo(0, "csp-violation", reportUri.CspReport.DocumentUri, userAgent.ToString() ?? string.Empty, new ReportToBody(reportUri.CspReport));
                }
                else
                {
                    reportTo = JsonSerializer.Deserialize<ReportTo>(json);
                    reportTo.UserAgent = userAgent.ToString() ?? string.Empty;
                }

                return await InputFormatterResult.SuccessAsync(reportTo);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Read failed: json = {json}");
                return await InputFormatterResult.FailureAsync();
            }
        }
    }
}