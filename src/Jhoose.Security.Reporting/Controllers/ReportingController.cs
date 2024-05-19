using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Jhoose.Security.Reporting.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

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

        public ReportingController(IReportingRepository reportingRepository)
        {
            string g= "test";
            this.reportingRepository = reportingRepository;
        }
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ReportTo reportTo)
        {
            await reportingRepository.AddReport(reportTo);

            return Ok();
        }

        [HttpOptions]
        public IActionResult Options([FromHeader(Name = "Access-Control-Request-Method")] string requestMethod, 
                                    [FromHeader(Name = "Access-Control-Request-Headers")] string requestHeaders)
        {
            var a = this.Request;
            Response.Headers.Add("Access-Control-Allow-Origin", new[] { (string?)Request.Headers["Origin"] });
            Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
            Response.Headers.Add("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            Response.Headers.Add("Access-Control-Max-Age", "86400");
            
            return Ok();
        }   

    }
}