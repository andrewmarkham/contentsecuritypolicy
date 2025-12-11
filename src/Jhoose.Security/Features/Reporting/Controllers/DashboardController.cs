
using System;
using System.Text.Json;
using System.Threading.Tasks;

using Jhoose.Security.Features.Reporting.Models.Dashboard;
using Jhoose.Security.Features.Reporting.Models.Search;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Features.Reporting.Controllers;

/// <summary>
/// API controller for reporting dashboard operations.
/// </summary>
/// <param name="dashboardService"></param>
/// <param name="logger"></param>
[Route("api/jhoose/[controller]")]
[ApiController]
[Authorize(Policy = Constants.Authentication.PolicyName)]
public class DashboardController(
                     IDashboardService dashboardService,
                     ILogger<DashboardController> logger) : ControllerBase
{
    private static readonly JsonSerializerOptions jsonSerializerOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    /// <summary>
    /// Gets the dashboard summary.
    /// </summary>
    /// <param name="query">The dashboard summary query.</param>
    /// <returns>The dashboard summary.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(DashboardSummary), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(DashboardSummary), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DashboardSummary>> Dashboard([FromBody] DashboardSummaryQuery query)
    {
        try
        {
            var result = await dashboardService.BuildSummary(query);

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


    /// <summary>
    /// Searches for CSP policies.
    /// </summary>
    /// <param name="searchParams">The search parameters.</param>
    /// <returns>The search results.</returns>
    [HttpPost]
    [Route("search")]
    [ProducesResponseType(typeof(CspSearchResults), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(CspSearchResults), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<CspSearchResults>> Search(CspSearchParams searchParams)
    {
        try
        {
            var result = await dashboardService.Search(searchParams);

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