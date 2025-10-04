
using System;
using System.Text.Json;
using System.Threading.Tasks;

using Jhoose.Security.Authorization;
using Jhoose.Security.Reporting;
using Jhoose.Security.Reporting.Models.Dashboard;
using Jhoose.Security.Reporting.Models.Search;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Controllers.Api;

//

[Route("api/jhoose/[controller]")]
[ApiController]
[Authorize(Policy = Constants.PolicyName)]
public class DashboardController(
                     IDashboardService dashboardService,
                     ILogger<DashboardController> logger) : ControllerBase
{
    //private static readonly JsonSerializerSettings jsonSerializerSettings = new() { ContractResolver = new CamelCasePropertyNamesContractResolver() };
    private static readonly JsonSerializerOptions jsonSerializerOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };


    [HttpPost]
    [ProducesResponseType(typeof(DashboardSummary), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(DashboardSummary), StatusCodes.Status500InternalServerError)]
    /// <summary>
    /// Gets the dashboard summary.
    /// </summary>
    /// <param name="query">The dashboard summary query.</param>
    /// <returns>The dashboard summary.</returns>
    public async Task<ActionResult<DashboardSummary>> Dashboard([FromBody] DashboardSummaryQuery query)
    {
        try
        {
            var result = await dashboardService.BuildSummary(query);

            //string json = JsonConvert.SerializeObject(result, jsonSerializerSettings);

            //return Content(json, "application/json");

            return new JsonResult(result, jsonSerializerOptions)
            {
                StatusCode = StatusCodes.Status200OK,
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting dashboard summary");
            return Problem(ex.Message, statusCode: 500);
        }
    }

    [HttpPost]
    [Route("search")]
    [ProducesResponseType(typeof(CspSearchResults), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(CspSearchResults), StatusCodes.Status500InternalServerError)]
    /// <summary>
    /// Searches for CSP policies.
    /// </summary>
    /// <param name="searchParams">The search parameters.</param>
    /// <returns>The search results.</returns>
    public async Task<ActionResult<CspSearchResults>> Search(CspSearchParams searchParams)
    {
        try
        {
            var result = await dashboardService.Search(searchParams);

            //string json = JsonConvert.SerializeObject(result, jsonSerializerSettings);

            //return Content(json, "application/json");

            return new JsonResult(result, jsonSerializerOptions)
            {
                StatusCode = StatusCodes.Status200OK,
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting settings");
            return Problem(ex.Message, statusCode: 500);
        }
    }
}