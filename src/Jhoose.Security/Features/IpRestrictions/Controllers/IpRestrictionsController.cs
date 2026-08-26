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
/// Controller for managing IP restriction allow-list entries.
/// </summary>
[Route("api/jhoose/[controller]")]
[ApiController]
[Authorize(Policy = Constants.Authentication.PolicyName)]
public class IpRestrictionsController(
    ISecurityRepository<IpRestrictionEntry> ipRestrictionRepository,
    ISettingsRepository settingsRepository,
    IWebhookNotifications webhookNotifications,
    ILogger<IpRestrictionsController> logger) : NotificationBaseController(settingsRepository, webhookNotifications)
{
    private static readonly JsonSerializerOptions jsonSerializerOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    private readonly ILogger<IpRestrictionsController> logger = logger;
    private readonly ISecurityRepository<IpRestrictionEntry> ipRestrictionRepository = ipRestrictionRepository;

    /// <summary>
    /// Lists all IP restriction entries.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<IpRestrictionEntry>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public ActionResult<List<IpRestrictionEntry>> List()
    {
        try
        {
            return new JsonResult(ipRestrictionRepository.Load().ToList(), jsonSerializerOptions)
            {
                StatusCode = StatusCodes.Status200OK,
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error listing IP restriction entries");
            return Problem(ex.Message, statusCode: 500);
        }
    }

    /// <summary>
    /// Saves a single IP restriction entry.
    /// </summary>
    [HttpPost()]
    [ProducesResponseType(typeof(IpRestrictionEntry), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public ActionResult<IpRestrictionEntry> Save([FromBody] IpRestrictionEntry entry)
    {
        try
        {
            if (!IpNetworkParser.IsValid(entry.Value))
            {
                return Problem($"'{entry.Value}' is not a valid IP address or CIDR range.", statusCode: 400);
            }

            this.NotifyWebhooks();

            return new JsonResult(ipRestrictionRepository.Save(entry), jsonSerializerOptions)
            {
                StatusCode = StatusCodes.Status200OK,
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error saving IP restriction entry");
            return Problem(ex.Message, statusCode: 500);
        }
    }

    /// <summary>
    /// Validates and adds multiple IP restriction entries at once (e.g. a pasted block of addresses).
    /// </summary>
    [HttpPost("bulk")]
    [ProducesResponseType(typeof(BulkIpRestrictionResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public ActionResult<BulkIpRestrictionResult> SaveBulk([FromBody] BulkIpRestrictionRequest request)
    {
        try
        {
            var created = new List<IpRestrictionEntry>();
            var rejected = new List<string>();

            foreach (var rawValue in request.Values ?? [])
            {
                var value = rawValue?.Trim() ?? string.Empty;
                if (!IpNetworkParser.IsValid(value))
                {
                    rejected.Add(rawValue ?? string.Empty);
                    continue;
                }

                var entry = new IpRestrictionEntry(Guid.NewGuid(), value, request.Site);
                var saved = ipRestrictionRepository.Save(entry);
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

            return new JsonResult(new BulkIpRestrictionResult(created, rejected), jsonSerializerOptions)
            {
                StatusCode = StatusCodes.Status200OK,
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error bulk adding IP restriction entries");
            return Problem(ex.Message, statusCode: 500);
        }
    }

    /// <summary>
    /// Deletes an IP restriction entry by id.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public ActionResult Delete(Guid id)
    {
        try
        {
            var entry = ipRestrictionRepository.Load().FirstOrDefault(e => e.Id == id);
            if (entry == null)
            {
                return NotFound();
            }

            var deleted = ipRestrictionRepository.Delete(entry);
            if (!deleted)
            {
                return Problem("Failed to delete IP restriction entry.", statusCode: 500);
            }

            this.NotifyWebhooks();
            return StatusCode(StatusCodes.Status204NoContent);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting IP restriction entry");
            return Problem(ex.Message, statusCode: 500);
        }
    }
}
