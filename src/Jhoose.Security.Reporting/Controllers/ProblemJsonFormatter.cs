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

        try
        {
            context.HttpContext.Request.Headers.TryGetValue("User-Agent", out var userAgent);

            var apiStreamReader = new ReportApiStreamReader(parser);
            
            var reports = await apiStreamReader.ReadAsync(
                httpContext.Request.Body,
                userAgent.ToString() ?? string.Empty,
                httpContext.RequestAborted).ToListAsync();

            return await InputFormatterResult.SuccessAsync(reports);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Read report api failed");
            return await InputFormatterResult.FailureAsync();
        }
    }
}