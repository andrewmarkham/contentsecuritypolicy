
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;

using System.Collections.Generic;

using Jhoose.Security.Core.Repository;
using Jhoose.Security.Core.Models.CSP;
using System;

using Microsoft.Extensions.Logging;
using Jhoose.Security.Authorization;
using Jhoose.Security.Webhooks;
using System.Text.Json;

namespace Jhoose.Security.Controllers.Api;


[Route("api/jhoose/[controller]")]
[ApiController]
[Authorize(Policy = Constants.PolicyName)]
public class CspController : NotificationBaseController
{

    public CspController(ICspPolicyRepository policyRepository,
                          IWebhookNotifications webhookNotifications,
                          ILogger<CspController> logger) : base(policyRepository, webhookNotifications)
    {
        this.logger = logger;
        this.policyRepository = policyRepository;
    }
    private static readonly JsonSerializerOptions jsonSerializerOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    private readonly ILogger<CspController> logger;
    private readonly ICspPolicyRepository policyRepository;

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
