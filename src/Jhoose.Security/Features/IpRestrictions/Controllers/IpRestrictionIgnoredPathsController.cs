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
/// Controller for managing IP restriction ignored-path entries.
/// </summary>
[Route("api/jhoose/ipignoredpaths")]
[ApiController]
[Authorize(Policy = Constants.Authentication.PolicyName)]
public class IpRestrictionIgnoredPathsController(
    ISecurityRepository<IpRestrictionIgnoredPath> ignoredPathRepository,
    ISettingsRepository settingsRepository,
    IWebhookNotifications webhookNotifications,
    ILogger<IpRestrictionIgnoredPathsController> logger) : NotificationBaseController(settingsRepository, webhookNotifications)
{
    private static readonly JsonSerializerOptions jsonSerializerOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    private readonly ILogger<IpRestrictionIgnoredPathsController> logger = logger;
    private readonly ISecurityRepository<IpRestrictionIgnoredPath> ignoredPathRepository = ignoredPathRepository;

    /// <summary>
    /// Lists all IP restriction ignored-path entries.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<IpRestrictionIgnoredPath>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public ActionResult<List<IpRestrictionIgnoredPath>> List()
    {
        try
        {
            return new JsonResult(ignoredPathRepository.Load().ToList(), jsonSerializerOptions)
            {
                StatusCode = StatusCodes.Status200OK,
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error listing IP restriction ignored paths");
            return Problem(ex.Message, statusCode: 500);
        }
    }

    /// <summary>
    /// Saves a single IP restriction ignored-path entry.
    /// </summary>
    [HttpPost()]
    [ProducesResponseType(typeof(IpRestrictionIgnoredPath), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public ActionResult<IpRestrictionIgnoredPath> Save([FromBody] IpRestrictionIgnoredPath entry)
    {
        try
        {
            if (!IpRestrictionPathValidator.IsValid(entry.Value))
            {
                return Problem($"'{entry.Value}' is not a valid path.", statusCode: 400);
            }

            this.NotifyWebhooks();

            return new JsonResult(ignoredPathRepository.Save(entry), jsonSerializerOptions)
            {
                StatusCode = StatusCodes.Status200OK,
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error saving IP restriction ignored path");
            return Problem(ex.Message, statusCode: 500);
        }
    }

    /// <summary>
    /// Validates and adds multiple IP restriction ignored-path entries at once (e.g. a pasted block of paths).
    /// </summary>
    [HttpPost("bulk")]
    [ProducesResponseType(typeof(BulkIpRestrictionIgnoredPathResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public ActionResult<BulkIpRestrictionIgnoredPathResult> SaveBulk([FromBody] BulkIpRestrictionIgnoredPathRequest request)
    {
        try
        {
            var created = new List<IpRestrictionIgnoredPath>();
            var rejected = new List<string>();

            foreach (var rawValue in request.Values ?? [])
            {
                var value = rawValue?.Trim() ?? string.Empty;
                if (!IpRestrictionPathValidator.IsValid(value))
                {
                    rejected.Add(rawValue ?? string.Empty);
                    continue;
                }

                var entry = new IpRestrictionIgnoredPath(Guid.NewGuid(), value, request.Site);
                var saved = ignoredPathRepository.Save(entry);
                if (saved != null)
                {
                    created.Add(saved);
                }
                else
                {
                    rejected.Add(rawValue ?? string.Empty);
                }
            }

            if (created.Count > 0)
            {
                this.NotifyWebhooks();
            }

            return new JsonResult(new BulkIpRestrictionIgnoredPathResult(created, rejected), jsonSerializerOptions)
            {
                StatusCode = StatusCodes.Status200OK,
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error bulk adding IP restriction ignored paths");
            return Problem(ex.Message, statusCode: 500);
        }
    }

    /// <summary>
    /// Deletes an IP restriction ignored-path entry by id.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public ActionResult Delete(Guid id)
    {
        try
        {
            var entry = ignoredPathRepository.Load().FirstOrDefault(e => e.Id == id);
            if (entry == null)
            {
                return NotFound();
            }

            var deleted = ignoredPathRepository.Delete(entry);
            if (!deleted)
            {
                return Problem("Failed to delete IP restriction ignored path.", statusCode: 500);
            }

            this.NotifyWebhooks();
            return StatusCode(StatusCodes.Status204NoContent);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting IP restriction ignored path");
            return Problem(ex.Message, statusCode: 500);
        }
    }
}
