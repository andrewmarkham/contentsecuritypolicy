
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

namespace Jhoose.Security.Controllers
{
    [Authorize]

    //

    [Route("api/[controller]")]
    [ApiController]
    public class CspController : ControllerBase
    {
        private readonly ICspPolicyRepository policyRepository;
        private readonly IResponseHeadersRepository responseHeadersRepository;
        private readonly JhooseSecurityOptions options;
        private readonly ILogger<CspController> logger;

        public CspController(ICspPolicyRepository policyRepository,
                             IResponseHeadersRepository responseHeadersRepository,
                             IOptions<JhooseSecurityOptions> options,
                             ILogger<CspController> logger)
        {
            this.policyRepository = policyRepository;
            this.responseHeadersRepository = responseHeadersRepository;
            this.options = options.Value;
            this.logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(typeof(List<CspPolicy>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(List<CspPolicy>), StatusCodes.Status500InternalServerError)]
        public ActionResult<List<CspPolicy>> List()
        {
            return Ok(this.policyRepository.List());
        }

        [HttpPost]
        [ProducesResponseType(typeof(CspPolicy), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CspPolicy), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(CspPolicy), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(CspPolicy), StatusCodes.Status500InternalServerError)]

        public ActionResult<CspPolicy> Update(CspPolicy policy)
        {
            return Ok(this.policyRepository.Update(policy));
        }


        [HttpGet]
        [Route("settings")]
        [ProducesResponseType(typeof(CspSettings), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CspSettings), StatusCodes.Status500InternalServerError)]
        public ActionResult<CspSettings> Settings()
        {
            return Ok(this.policyRepository.Settings());
        }

        [HttpPost]
        [Route("settings")]
        [ProducesResponseType(typeof(CspSettings), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CspSettings), StatusCodes.Status500InternalServerError)]
        public ActionResult<CspSettings> Settings(CspSettings settings)
        {
            var result = this.policyRepository.SaveSettings(settings);

            if (result)
                return Ok(settings);
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

                string json = JsonConvert.SerializeObject(resp, new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });
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
        public ActionResult<ResponseHeader> Settings([FromBody] ResponseHeader header)
        {
            try
            {
                var result = this.responseHeadersRepository.Update(header);
                return Ok(header);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error getting settings");
                return Problem(ex.Message, statusCode: 500);
            }
        }
    }
}