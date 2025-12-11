
using System;
using System.Collections.Generic;
using System.Text.Json;

using Jhoose.Security.Features.Core.Controllers;
using Jhoose.Security.Features.Core.Webhooks;
using Jhoose.Security.Features.CSP.Models;
using Jhoose.Security.Features.CSP.Repository;
using Jhoose.Security.Features.Settings.Repository;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Features.CSP.Controllers;


/// <summary>
/// Controller for managing Content Security Policy (CSP) policies.
/// </summary>
/// <param name="policyRepository">Repository used to read and modify CSP policies.</param>
/// <param name="settingsRepository">Repository used to read application settings.</param>
/// <param name="webhookNotifications">Service used to send webhook notifications.</param>
/// <param name="logger">Logger for diagnostic messages.</param>
[Route("api/jhoose/[controller]")]
[ApiController]
[Authorize(Policy = Constants.Authentication.PolicyName)]
public class CspController(ICspPolicyRepository policyRepository,
                      ISettingsRepository settingsRepository,
                      IWebhookNotifications webhookNotifications,
                      ILogger<CspController> logger) : NotificationBaseController(settingsRepository, webhookNotifications)
{
    private static readonly JsonSerializerOptions jsonSerializerOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    private readonly ILogger<CspController> logger = logger;
    private readonly ICspPolicyRepository policyRepository = policyRepository;

    [HttpGet]
    [ProducesResponseType(typeof(List<CspPolicy>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(List<CspPolicy>), StatusCodes.Status500InternalServerError)]
    /// <summary>
    /// Lists all CSP policies.
    /// </summary>
    /// <returns>A list of CSP policies.</returns>
    public ActionResult<List<CspPolicy>> List()
    {
        try
        {
            return new JsonResult(policyRepository.List(), jsonSerializerOptions)
            {
                StatusCode = StatusCodes.Status200OK,
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error listing CSP policies");
            return Problem(ex.Message, statusCode: 500);
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(CspPolicy), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(CspPolicy), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(CspPolicy), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(CspPolicy), StatusCodes.Status500InternalServerError)]

    /// <summary>
    /// Updates an existing CSP policy.
    /// </summary>
    /// <param name="policy">The CSP policy to update.</param>
    /// <returns>The updated CSP policy.</returns>
    public ActionResult<CspPolicy> Update(CspPolicy policy)
    {
        try
        {
            this.NotifyWebhooks();

            return new JsonResult(policyRepository.Update(policy), jsonSerializerOptions)
            {
                StatusCode = StatusCodes.Status200OK,
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating CSP policy");
            return Problem(ex.Message, statusCode: 500);
        }
    }
}
