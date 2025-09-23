
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;

using Jhoose.Security.Core.Repository;
using Jhoose.Security.Core.Models.CSP;
using System;

using Microsoft.Extensions.Logging;

using Jhoose.Security.Webhooks;
using System.Text.Json;
using Jhoose.Security.Core.Models.Export;

using Jhoose.Security.Core.Services;
using System.Collections.Generic;
using Jhoose.Security.Authorization;

namespace Jhoose.Security.Controllers.Api;

[Route("api/jhoose/[controller]")]
[ApiController]
[Authorize(Policy = Constants.PolicyName)]
public class SettingsController : NotificationBaseController
{
    //private static readonly JsonSerializerSettings jsonSerializerSettings = new() { ContractResolver = new CamelCasePropertyNamesContractResolver() };
    private static readonly JsonSerializerOptions jsonSerializerOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    private readonly ILogger<SettingsController> logger;
    private readonly ICspPolicyRepository policyRepository;
    private readonly IResponseHeadersRepository responseHeadersRepository;
    private readonly IImportExportService importExportService;
    private readonly IImportRepository importRepository;

    public SettingsController(ICspPolicyRepository policyRepository,
                              IResponseHeadersRepository responseHeadersRepository,
                              IWebhookNotifications webhookNotifications,
                              IImportExportService importExportService,
                              IImportRepository importRepository,
                              ILogger<SettingsController> logger) : base(policyRepository, webhookNotifications)
    {
        this.logger = logger;
        this.policyRepository = policyRepository;
        this.responseHeadersRepository = responseHeadersRepository;
        this.importExportService = importExportService;
        this.importRepository = importRepository;
    }

    [HttpGet]
    //[Route("settings")]
    [ProducesResponseType(typeof(CspSettings), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(CspSettings), StatusCodes.Status500InternalServerError)]
    /// <summary>
    /// Gets the CSP settings.
    /// </summary>
    /// <returns>The CSP settings.</returns>
    public ActionResult<CspSettings> Settings()
    {
        try
        {
            var settings = policyRepository.Settings();

            //string json = JsonConvert.SerializeObject(settings, jsonSerializerSettings);

            //return Content(json, "application/json");
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

    [HttpPost]
    //[Route("settings")]
    [ProducesResponseType(typeof(CspSettings), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(CspSettings), StatusCodes.Status500InternalServerError)]
    /// <summary>
    /// Updates the CSP settings.
    /// </summary>
    /// <param name="settings">The CSP settings to update.</param>
    /// <returns>The updated CSP settings.</returns>
    public ActionResult<CspSettings> Settings(CspSettings settings)
    {
        try
        {
            var result = policyRepository.SaveSettings(settings);

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

    [HttpPost]
    [Route("export")]
    [ProducesResponseType(typeof(JhoooseSecurityExport), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(JhoooseSecurityExport), StatusCodes.Status500InternalServerError)]
    public ActionResult<JhoooseSecurityExport> Export([FromBody]ExportOptions options)
    {
        var export = importExportService.Export(options.ExportCsp, options.ExportHeaders, options.ExportSettings);
        return new JsonResult(export, jsonSerializerOptions)
        {
            StatusCode = StatusCodes.Status200OK,
        };
    }

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
