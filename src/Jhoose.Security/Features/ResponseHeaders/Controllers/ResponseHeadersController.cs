
using System;
using System.Text.Json;

using Jhoose.Security.Configuration;
using Jhoose.Security.Webhooks;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Jhoose.Security.Features.Reporting;
using Jhoose.Security.Features.CSP.Repository;

using Jhoose.Security.Controllers.Api;
using Jhoose.Security.Features.ResponseHeaders.Repository;
using Jhoose.Security.Features.ResponseHeaders.Models;
using Jhoose.Security.Features.Settings.Repository;

namespace Jhoose.Security.Features.ResponseHeaders.Controllers;

/// <summary>
/// Controller for managing response headers and related operations.
/// </summary>
/// <param name="policyRepository">Repository for CSP policies.</param>
/// <param name="responseHeadersRepository">Repository for response headers.</param>
/// <param name="settingsRepository">Repository for application settings.</param>
/// <param name="options">Injected options for JhooseSecurity.</param>
/// <param name="webhookNotifications">Service for sending webhook notifications.</param>
/// <param name="dashboardService">Service for dashboard reporting.</param>
/// <param name="logger">Logger instance for the controller.</param>
[Route("api/jhoose/[controller]")]
[ApiController]
[Authorize(Policy = Authorization.Constants.PolicyName)]
public class ResponseHeadersController(ICspPolicyRepository policyRepository,
                     IResponseHeadersRepository responseHeadersRepository,
                     ISettingsRepository settingsRepository,
                     IOptions<JhooseSecurityOptions> options,
                     IWebhookNotifications webhookNotifications,
                     IDashboardService dashboardService,
                     ILogger<ResponseHeadersController> logger) : NotificationBaseController(settingsRepository, webhookNotifications)
{
    //private static readonly JsonSerializerSettings jsonSerializerSettings = new() { ContractResolver = new CamelCasePropertyNamesContractResolver() };
    private static readonly JsonSerializerOptions jsonSerializerOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    private readonly ICspPolicyRepository policyRepository = policyRepository;
    private readonly IResponseHeadersRepository responseHeadersRepository = responseHeadersRepository;
    private readonly IWebhookNotifications webhookNotifications = webhookNotifications;
    private readonly IDashboardService dashboardService = dashboardService;
    private readonly JhooseSecurityOptions options = options.Value;
    private readonly ILogger<ResponseHeadersController> logger = logger;

    [HttpGet]
    [ProducesResponseType(typeof(ResponseHeader), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ResponseHeader), StatusCodes.Status500InternalServerError)]
    /// <summary>
    /// Gets the response headers.
    /// </summary>
    /// <returns>The response headers.</returns>
    public ActionResult<ResponseHeader> Header()
    {
        try
        {
            var items = this.responseHeadersRepository.List();

            var resp = new
            {
                UseHeadersUI = this.options.UseHeadersUI,
                Headers = items
            };

            //string json = JsonConvert.SerializeObject(resp, jsonSerializerSettings);
            //return Content(json, "application/json");

            return new JsonResult(resp, jsonSerializerOptions)
            {
                StatusCode = StatusCodes.Status200OK,
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting header");
            return Problem(ex.Message, statusCode: 500);
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(ResponseHeader), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ResponseHeader), StatusCodes.Status500InternalServerError)]
    /// <summary>
    /// Updates an existing response header.
    /// </summary>
    /// <param name="header">The response header to update.</param>
    /// <returns>The updated response header.</returns>
    public ActionResult<ResponseHeader> Settings([FromBody] ResponseHeader header)
    {
        try
        {
            var result = this.responseHeadersRepository.Update(header);

            //string json = JsonConvert.SerializeObject(result, jsonSerializerSettings);

            this.NotifyWebhooks();

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