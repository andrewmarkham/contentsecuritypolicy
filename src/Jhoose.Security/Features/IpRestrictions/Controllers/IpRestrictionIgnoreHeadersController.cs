using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.Core.Controllers;
using Jhoose.Security.Features.Core.Webhooks;
using Jhoose.Security.Features.IpRestrictions.Models;
using Jhoose.Security.Features.Settings.Repository;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Features.IpRestrictions.Controllers;

/// <summary>
/// Controller for managing IP restriction ignore-header entries.
/// </summary>
[Route("api/jhoose/ignoreheaders")]
[ApiController]
[Authorize(Policy = Constants.Authentication.PolicyName)]
public class IpRestrictionIgnoreHeadersController(
    ISecurityRepository<IpRestrictionIgnoreHeader> ignoreHeaderRepository,
    ISettingsRepository settingsRepository,
    IWebhookNotifications webhookNotifications,
    ILogger<IpRestrictionIgnoreHeadersController> logger) : NotificationBaseController(settingsRepository, webhookNotifications)
{
    private static readonly JsonSerializerOptions jsonSerializerOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    private readonly ILogger<IpRestrictionIgnoreHeadersController> logger = logger;
    private readonly ISecurityRepository<IpRestrictionIgnoreHeader> ignoreHeaderRepository = ignoreHeaderRepository;

    /// <summary>
    /// Lists all IP restriction ignore-header entries.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<IpRestrictionIgnoreHeader>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public ActionResult<List<IpRestrictionIgnoreHeader>> List()
    {
        try
        {
            return new JsonResult(ignoreHeaderRepository.Load().ToList(), jsonSerializerOptions)
            {
                StatusCode = StatusCodes.Status200OK,
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error listing IP restriction ignore headers");
            return Problem(ex.Message, statusCode: 500);
        }
    }

    /// <summary>
    /// Saves a single IP restriction ignore-header entry.
    /// </summary>
    [HttpPost()]
    [ProducesResponseType(typeof(IpRestrictionIgnoreHeader), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public ActionResult<IpRestrictionIgnoreHeader> Save([FromBody] IpRestrictionIgnoreHeader entry)
    {
        try
        {
            if (!IpRestrictionHeaderValidator.IsValid(entry.HeaderName, entry.HeaderValue))
            {
                return Problem($"'{entry.HeaderName}' / '{entry.HeaderValue}' is not a valid header name/value pair.", statusCode: 400);
            }

            this.NotifyWebhooks();

            return new JsonResult(ignoreHeaderRepository.Save(entry), jsonSerializerOptions)
            {
                StatusCode = StatusCodes.Status200OK,
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error saving IP restriction ignore header");
            return Problem(ex.Message, statusCode: 500);
        }
    }

    /// <summary>
    /// Deletes an IP restriction ignore-header entry by id.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public ActionResult Delete(Guid id)
    {
        try
        {
            var entry = ignoreHeaderRepository.Load().FirstOrDefault(e => e.Id == id);
            if (entry == null)
            {
                return NotFound();
            }

            var deleted = ignoreHeaderRepository.Delete(entry);
            if (!deleted)
            {
                return Problem("Failed to delete IP restriction ignore header.", statusCode: 500);
            }

            this.NotifyWebhooks();
            return StatusCode(StatusCodes.Status204NoContent);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting IP restriction ignore header");
            return Problem(ex.Message, statusCode: 500);
        }
    }
}
