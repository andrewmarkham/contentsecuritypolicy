using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Jhoose.Security.Features.Reporting.Models;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using Microsoft.AspNetCore.RateLimiting;


namespace Jhoose.Security.Features.Reporting.Controllers;

[ApiController]
[Route("api/[controller]")]

[EnableRateLimiting("fixed")]
public class ReportingController : ControllerBase
{
    private readonly IReportingRepository reportingRepository;

    public ReportingController(IReportingRepositoryFactory reportingRepositoryFactory)
    {
        this.reportingRepository = reportingRepositoryFactory.GetReportingRepository() ?? throw new ArgumentNullException(nameof(reportingRepository));
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] List<ReportTo<IReportToBody>> reportTos)
    {
        await reportingRepository.AddReports(reportTos);
        return Ok();
    }

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