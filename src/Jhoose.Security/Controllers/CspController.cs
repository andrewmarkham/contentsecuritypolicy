
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;

using System.Collections.Generic;

using Jhoose.Security.Core.Repository;
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Models.CSP;
using System;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Jhoose.Security.Authorization;
using Jhoose.Security.Webhooks;
using System.Threading.Tasks;

namespace Jhoose.Security.Controllers
{
    //

    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = Constants.PolicyName)]
    public class CspController : ControllerBase
    {
        private static JsonSerializerSettings jsonSerializerSettings = new() { ContractResolver = new CamelCasePropertyNamesContractResolver() };

        private readonly ICspPolicyRepository policyRepository;
        private readonly IResponseHeadersRepository responseHeadersRepository;
        private readonly IWebhookNotifications webhookNotifications;
        private readonly JhooseSecurityOptions options;
        private readonly ILogger<CspController> logger;

        public CspController(ICspPolicyRepository policyRepository,
                             IResponseHeadersRepository responseHeadersRepository,
                             IOptions<JhooseSecurityOptions> options,
                             IWebhookNotifications webhookNotifications,
                             ILogger<CspController> logger)
        {
            this.policyRepository = policyRepository;
            this.responseHeadersRepository = responseHeadersRepository;
            this.webhookNotifications = webhookNotifications;
            this.options = options.Value;
            this.logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(typeof(List<CspPolicy>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(List<CspPolicy>), StatusCodes.Status500InternalServerError)]
        public ActionResult<List<CspPolicy>> List()
        {
            string json = JsonConvert.SerializeObject(this.policyRepository.List(), jsonSerializerSettings);
            return Content(json, "application/json");
        }

        [HttpPost]
        [ProducesResponseType(typeof(CspPolicy), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CspPolicy), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(CspPolicy), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(CspPolicy), StatusCodes.Status500InternalServerError)]

        public ActionResult<CspPolicy> Update(CspPolicy policy)
        {
            string json = JsonConvert.SerializeObject(this.policyRepository.Update(policy), jsonSerializerSettings);

            this.NotifyWebhooks();

            return Content(json, "application/json");
        }


        [HttpGet]
        [Route("settings")]
        [ProducesResponseType(typeof(CspSettings), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CspSettings), StatusCodes.Status500InternalServerError)]
        public ActionResult<CspSettings> Settings()
        {
            string json = JsonConvert.SerializeObject(this.policyRepository.Settings(), jsonSerializerSettings);
            return Content(json, "application/json");
        }

        [HttpPost]
        [Route("settings")]
        [ProducesResponseType(typeof(CspSettings), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CspSettings), StatusCodes.Status500InternalServerError)]
        public ActionResult<CspSettings> Settings(CspSettings settings)
        {
            var result = this.policyRepository.SaveSettings(settings);

            if (result)
            {
                string json = JsonConvert.SerializeObject(settings, jsonSerializerSettings);

                this.NotifyWebhooks();

                return Content(json, "application/json");
            }
            else
                return StatusCode(StatusCodes.Status500InternalServerError);
        }


        [HttpGet]
        [Route("header")]
        [ProducesResponseType(typeof(ResponseHeader), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ResponseHeader), StatusCodes.Status500InternalServerError)]
        public ActionResult<ResponseHeader> Header()
        {
            try
            {
                var items = this.responseHeadersRepository.List().ToList();

                var resp = new
                {
                    UseHeadersUI = this.options.UseHeadersUI,
                    Headers = items
                };

                string json = JsonConvert.SerializeObject(resp, jsonSerializerSettings);
                return Content(json, "application/json");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error getting header");
                return Problem(ex.Message, statusCode: 500);
            }
        }

        [HttpPost]
        [Route("header")]
        [ProducesResponseType(typeof(ResponseHeader), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ResponseHeader), StatusCodes.Status500InternalServerError)]
        public  ActionResult<ResponseHeader> Settings([FromBody] ResponseHeader header)
        {
            try
            {
                var result = this.responseHeadersRepository.Update(header);

                string json = JsonConvert.SerializeObject(result, jsonSerializerSettings);

                this.NotifyWebhooks();

                return Content(json, "application/json");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error getting settings");
                return Problem(ex.Message, statusCode: 500);
            }
        }

        private void NotifyWebhooks()
        {
            var settings = this.policyRepository.Settings();
            var webhoookUrls = settings.WebhookUrls?.Select(u => new Uri(u)).ToList() ?? [];
            
            webhookNotifications.Notify(webhoookUrls );
        }
    }
}