
using System;
using System.Linq;
using System.Text.Json;

using Jhoose.Security.Configuration;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using Jhoose.Security.Features.ResponseHeaders.Models;
using Jhoose.Security.Features.Settings.Repository;
using Jhoose.Security.Features.Core.Webhooks;
using Jhoose.Security.Features.Core.Controllers;
using Jhoose.Security.Features.Core;

namespace Jhoose.Security.Features.ResponseHeaders.Controllers;

/// <summary>
/// Controller for managing response headers and related operations.
/// </summary>
/// <param name="responseHeadersRepository">Repository for response headers.</param>
/// <param name="settingsRepository">Repository for application settings.</param>
/// <param name="options">Injected options for JhooseSecurity.</param>
/// <param name="webhookNotifications">Service for sending webhook notifications.</param>
/// <param name="logger">Logger instance for the controller.</param>
[Route("api/jhoose/[controller]")]
[ApiController]
[Authorize(Policy = Constants.Authentication.PolicyName)]
public class ResponseHeadersController(
                     ISecurityRepository<ResponseHeader>  responseHeadersRepository,
                     ISettingsRepository settingsRepository,
                     IOptions<JhooseSecurityOptions> options,
                     IWebhookNotifications webhookNotifications,
                     ILogger<ResponseHeadersController> logger) : NotificationBaseController(settingsRepository, webhookNotifications)
{
    private static readonly JsonSerializerOptions jsonSerializerOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    private readonly JhooseSecurityOptions options = options.Value;

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
            var items = responseHeadersRepository.Load();

            var resp = new
            {
                UseHeadersUI = this.options.UseHeadersUI,
                Headers = items
            };

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
            var result = responseHeadersRepository.Save(header);

            this.NotifyWebhooks();

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

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    /// <summary>
    /// Deletes a response header by id.
    /// </summary>
    /// <param name="id">The response header id to delete.</param>
    public ActionResult Delete(Guid id)
    {
        try
        {
            var header = responseHeadersRepository.Load().FirstOrDefault(h => h.Id == id);
            if (header == null)
            {
                return NotFound();
            }

            var deleted = responseHeadersRepository.Delete(header);
            if (!deleted)
            {
                return Problem("Failed to delete response header.", statusCode: 500);
            }

            this.NotifyWebhooks();
            return StatusCode(StatusCodes.Status204NoContent);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting response header");
            return Problem(ex.Message, statusCode: 500);
        }
    }
}
