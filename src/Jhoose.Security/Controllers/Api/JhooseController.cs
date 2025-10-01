
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

using Jhoose.Security.Authorization;
using Jhoose.Security.Core.Cache;
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Models.CSP;
using Jhoose.Security.Core.Provider;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Jhoose.Security.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class JhooseController(ICspProvider cspProvider,
        IResponseHeadersProvider responseHeaderProvider,
        ICacheManager cache,
        ILogger<JhooseController> logger) : ControllerBase
    {
        public class HeaderRequest
        {
            public string Nonce { get; set; } = string.Empty;
        }

        //private static JsonSerializerSettings jsonSerializerSettings =new() { ContractResolver = new CamelCasePropertyNamesContractResolver() };
        private static readonly JsonSerializerOptions jsonSerializerOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

        [ApiKeyAuthorization]
        [HttpPost]
        [Route("headers")]
        public ActionResult Headers(
            [FromBody] HeaderRequest headerRequest)
        {
            try
            {
                /*
                await Task.Run(() =>
                {
                    var headers = this.GetHeaders().ToList();
                    headers.AddRange(this.GetContentSecurityPolicy(headerRequest.Nonce));

                    json = JsonConvert.SerializeObject(headers, jsonSerializerSettings);
                });

                //return Content(json ?? "[]", "application/json");
                */

                var headers = this.GetHeaders().ToList();
                headers.AddRange(this.GetContentSecurityPolicy(headerRequest.Nonce));

                return new JsonResult(headers ?? [], jsonSerializerOptions)
                {
                    StatusCode = StatusCodes.Status200OK,
                };
            }
            catch (Exception e)
            {
                logger.LogError(e, "Error getting headers/csp");
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        private IEnumerable<KeyValuePair<string, string>> GetHeaders()
        {
            var headerValues = cache.Get<List<ResponseHeader>>(Core.Constants.ResponseHeadersCacheKey,
                () => [.. responseHeaderProvider.ResponseHeaders().Where(h => h.Enabled)], new TimeSpan(1, 0, 0));


            foreach (var header in headerValues)
            {
                yield return new KeyValuePair<string, string>(header.Name, header.Value);
            }
        }

        private IEnumerable<KeyValuePair<string, string>> GetContentSecurityPolicy(string nonce)
        {
            // get the policy settings
            var policySettings = cache.Get<CspSettings>(Core.Constants.SettingsCacheKey, () => cspProvider.Settings,
                new TimeSpan(1, 0, 0));

            if (policySettings.IsEnabled)
            {
                // get the policy
                var headerValues = cache.Get<List<CspPolicyHeaderBase>>(Core.Constants.PolicyCacheKey,
                    () => [.. cspProvider.PolicyHeaders()], new TimeSpan(1, 0, 0));

                foreach (var header in headerValues)
                {
                    header.NonceValue = nonce;
                    yield return new KeyValuePair<string, string>(header.Name, header.Value);
                }
            }
        }
    }
}