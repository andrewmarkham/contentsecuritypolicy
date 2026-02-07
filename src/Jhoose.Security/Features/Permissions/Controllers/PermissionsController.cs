using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.Core.Controllers;
using Jhoose.Security.Features.Core.Webhooks;
using Jhoose.Security.Features.Permissions.Models;
using Jhoose.Security.Features.Settings.Repository;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Features.Permissions.Controllers;


/// <summary>
/// Controller for managing permission policies.
/// </summary>
/// <param name="permissionsRepository">Repository for permissions.</param>
/// <param name="settingsRepository">Repository for settings used by the base controller.</param>
/// <param name="webhookNotifications">Service to notify webhooks on changes.</param>
/// <param name="logger">Logger instance for this controller.</param>
[Route("api/jhoose/[controller]")]
[ApiController]
[Authorize(Policy = Constants.Authentication.PolicyName)]
public class PermissionsController(ISecurityRepository<PermissionPolicy>  permissionsRepository,
                                ISettingsRepository settingsRepository,
                                IWebhookNotifications webhookNotifications,
                                ILogger<PermissionsController> logger) : NotificationBaseController(settingsRepository, webhookNotifications)
{
    private static readonly JsonSerializerOptions jsonSerializerOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    private readonly ILogger<PermissionsController> logger = logger;
    private readonly ISecurityRepository<PermissionPolicy> permissionsRepository = permissionsRepository;

    [HttpGet]
    [ProducesResponseType(typeof(List<PermissionPolicy>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    /// <summary>
    /// Lists all permission policies.
    /// </summary>
    /// <returns>A list of permission policies.</returns>
    public ActionResult<List<PermissionPolicy>> List()
    {
        try
        {
            return new JsonResult(permissionsRepository.Load().ToList(), jsonSerializerOptions)
            {
                StatusCode = StatusCodes.Status200OK,
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error listing Permissions policies");
            return Problem(ex.Message, statusCode: 500);
        }
    }


    /// <summary>
    /// Gets a permission policy by key.
    /// </summary>
    /// <param name="policy"></param>
    /// <returns>The permission policy.</returns>
    [HttpPost()]
    [ProducesResponseType(typeof(PermissionPolicy), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public ActionResult<PermissionPolicy> Save([FromBody]PermissionPolicy policy)
    {
        try
        {
            this.NotifyWebhooks();

            return new JsonResult(permissionsRepository.Save(policy), jsonSerializerOptions)
            {
                StatusCode = StatusCodes.Status200OK,
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating Permissions policy");
            return Problem(ex.Message, statusCode: 500);
        }
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    /// <summary>
    /// Deletes a permission policy by id.
    /// </summary>
    /// <param name="id">The permission policy id to delete.</param>
    public ActionResult Delete(Guid id)
    {
        try
        {
            var policy = permissionsRepository.Load().FirstOrDefault(p => p.Id == id);
            if (policy == null)
            {
                return NotFound();
            }

            var deleted = permissionsRepository.Delete(policy);
            if (!deleted)
            {
                return Problem("Failed to delete permission policy.", statusCode: 500);
            }

            this.NotifyWebhooks();
            return StatusCode(StatusCodes.Status204NoContent);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting Permissions policy");
            return Problem(ex.Message, statusCode: 500);
        }
    }
}

