
using System;
using System.Collections.Generic;
using System.Text.Json;

using Jhoose.Security.Features.Core.Controllers;
using Jhoose.Security.Features.Core.Webhooks;
using Jhoose.Security.Features.ImportExport.Models;
using Jhoose.Security.Features.ImportExport.Repository;
using Jhoose.Security.Features.ImportExport.Services;
using Jhoose.Security.Features.Settings.Models;
using Jhoose.Security.Features.Settings.Repository;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Features.Settings.Controllers;

/// <summary>
/// API controller to manage Jhoose security settings, response headers, policy imports/exports and webhook notifications.
/// </summary>
/// <param name="settingsRepository">Repository for managing CSP settings.</param>
/// <param name="webhookNotifications">Service used to send webhook notifications.</param>
/// <param name="importExportService">Service to perform import and export operations.</param>
/// <param name="importRepository">Repository to persist and retrieve import records.</param>
/// <param name="logger">Logger instance for the controller.</param>
[Route("api/jhoose/[controller]")]
[ApiController]
[Authorize(Policy = Constants.Authentication.PolicyName)]
public class SettingsController(ISettingsRepository settingsRepository,
                          IWebhookNotifications webhookNotifications,
                          IImportExportService importExportService,
                          IImportRepository importRepository,
                          ILogger<SettingsController> logger) : NotificationBaseController(settingsRepository,webhookNotifications)
{
     private static readonly JsonSerializerOptions jsonSerializerOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    private readonly ILogger<SettingsController> logger = logger;
    private readonly ISettingsRepository settingsRepository = settingsRepository;
    private readonly IImportExportService importExportService = importExportService;
    private readonly IImportRepository importRepository = importRepository;


    /// <summary>
    /// Gets the CSP settings.
    /// </summary>
    /// <returns>The CSP settings.</returns>
    [HttpGet]
    //[Route("settings")]
    [ProducesResponseType(typeof(CspSettings), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(CspSettings), StatusCodes.Status500InternalServerError)]
    public ActionResult<CspSettings> Settings()
    {
        try
        {
            var settings = settingsRepository.Load();

            return new JsonResult(settings, jsonSerializerOptions)
            {
                StatusCode = StatusCodes.Status200OK,
            };

        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting CSP settings");
            return Problem(ex.Message, statusCode: 500);
        }
    }


    /// <summary>
    /// Updates the CSP settings.
    /// </summary>
    /// <param name="settings">The CSP settings to update.</param>
    /// <returns>The updated CSP settings.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(CspSettings), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(CspSettings), StatusCodes.Status500InternalServerError)]
    public ActionResult<CspSettings> Settings(CspSettings settings)
    {
        try
        {
            var result = settingsRepository.SaveSettings(settings);

            if (result)
            {
                this.NotifyWebhooks();

                return new JsonResult(settings, jsonSerializerOptions)
                {
                    StatusCode = StatusCodes.Status200OK,
                };
            }
            else
                return StatusCode(StatusCodes.Status500InternalServerError);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating CSP settings");
            return Problem(ex.Message, statusCode: 500);
        }
    }


    /// <summary>
    /// Exports selected CSP policies, response headers, and settings according to the provided options.
    /// </summary>
    /// <param name="options">Options specifying which parts of the configuration to include in the export.</param>
    /// <returns>An export object containing the requested configuration data.</returns>
    [HttpPost]
    [Route("export")]
    [ProducesResponseType(typeof(JhoooseSecurityExport), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(JhoooseSecurityExport), StatusCodes.Status500InternalServerError)]
    public ActionResult<JhoooseSecurityExport> Export([FromBody] ExportOptions options)
    {
        var export = importExportService.Export(options.ExportCsp, options.ExportPermissions, options.ExportHeaders, options.ExportSettings);
        return new JsonResult(export, jsonSerializerOptions)
        {
            StatusCode = StatusCodes.Status200OK,
        };
    }


    /// <summary>
    /// Uploads an exported configuration package and persists it to the import repository.
    /// </summary>
    /// <param name="export">The exported configuration data to save; if null a BadRequest is returned.</param>
    /// <returns>Returns 204 No Content on success or 400 Bad Request if the export is null.</returns>
    [HttpPost]
    [Route("uploadimport")]
    [ProducesResponseType(typeof(JhoooseSecurityExport), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(JhoooseSecurityExport), StatusCodes.Status500InternalServerError)]
    public ActionResult UploadImport(JhoooseSecurityExport? export)
    {
        if (export == null)
        {
            return BadRequest("Invalid export data.");
        }

        importRepository.Save(export);

        return StatusCode(StatusCodes.Status204NoContent);
    }

    [HttpGet]
    [Route("listImports")]
    [ProducesResponseType(typeof(List<JhoooseSecurityExport>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(List<JhoooseSecurityExport>), StatusCodes.Status500InternalServerError)]
    public ActionResult<List<JhoooseSecurityExport>> ListImports()
    {
        var imports = importRepository.List();
        return new JsonResult(imports, jsonSerializerOptions)
        {
            StatusCode = StatusCodes.Status200OK,
        };
    }

    [HttpPost]
    [Route("import/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public ActionResult Import(Guid id)
    {
        var export = importRepository.Get(id);

        if (export == null)
        {
            return NotFound("Import not found.");
        }
        importExportService.Import(export);
        return StatusCode(StatusCodes.Status204NoContent);
    }

    [HttpDelete]
    [Route("import/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public ActionResult DeleteImport(Guid id)
    {
        importRepository.Delete(id);
        return StatusCode(StatusCodes.Status204NoContent);
    }
}