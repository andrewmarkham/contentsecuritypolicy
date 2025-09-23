using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Jhoose.Security.Reporting.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters;

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MyCSharp.HttpUserAgentParser.Providers;

#if NET7_0_OR_GREATER
using Microsoft.AspNetCore.RateLimiting;
#endif

namespace Jhoose.Security.Reporting.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
#if NET7_0_OR_GREATER
    [EnableRateLimiting("fixed")]
#endif
    public class ReportingController : ControllerBase
    {
        private readonly IReportingRepository reportingRepository;

        public ReportingController(IReportingRepositoryFactory reportingRepositoryFactory)
        {
            this.reportingRepository = reportingRepositoryFactory.GetReportingRepository() ?? throw new ArgumentNullException(nameof(reportingRepository));
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] List<ReportTo> reportTos)
        {
            foreach (var reportTo in reportTos)
                await reportingRepository.AddReport(reportTo);

            return Ok();
        }

        /*[HttpPost]
        public async Task<IActionResult> Post([FromBody] ReportTo reportTo)
        {
            await reportingRepository.AddReport(reportTo);

            return Ok();
        }*/

        [HttpOptions]
        public IActionResult Options([FromHeader(Name = "Access-Control-Request-Method")] string requestMethod,
                                    [FromHeader(Name = "Access-Control-Request-Headers")] string requestHeaders)
        {
            Response.Headers.Append("Access-Control-Allow-Origin", new[] { (string?)Request.Headers["Origin"] });
            Response.Headers.Append("Access-Control-Allow-Methods", "POST, OPTIONS");
            Response.Headers.Append("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            Response.Headers.Append("Access-Control-Max-Age", "86400");

            return Ok();
        }

    }
}