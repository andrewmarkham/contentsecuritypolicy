
using System;
using System.Text.Json;

using Jhoose.Security.Authorization;
using Jhoose.Security.Core.Configuration;
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Repository;
using Jhoose.Security.Reporting;
using Jhoose.Security.Webhooks;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Jhoose.Security.Controllers.Api;

[Route("api/jhoose/[controller]")]
[ApiController]
[Authorize(Policy = Constants.PolicyName)]
public class ResponseHeadersController : NotificationBaseController
{
    //private static readonly JsonSerializerSettings jsonSerializerSettings = new() { ContractResolver = new CamelCasePropertyNamesContractResolver() };
    private static readonly JsonSerializerOptions jsonSerializerOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    private readonly ICspPolicyRepository policyRepository;
    private readonly IResponseHeadersRepository responseHeadersRepository;
    private readonly IWebhookNotifications webhookNotifications;
    private readonly IDashboardService dashboardService;
    private readonly JhooseSecurityOptions options;
    private readonly ILogger<CspController> logger;

    public ResponseHeadersController(ICspPolicyRepository policyRepository,
                         IResponseHeadersRepository responseHeadersRepository,
                         IOptions<JhooseSecurityOptions> options,
                         IWebhookNotifications webhookNotifications,
                         IDashboardService dashboardService,
                         ILogger<CspController> logger) : base(policyRepository, webhookNotifications)
    {
        this.policyRepository = policyRepository;
        this.responseHeadersRepository = responseHeadersRepository;
        this.webhookNotifications = webhookNotifications;
        this.dashboardService = dashboardService;
        this.options = options.Value;
        this.logger = logger;
    }

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