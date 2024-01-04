
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Models.CSP;
using System;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Microsoft.Extensions.Logging;

using Jhoose.Security.Core.Cache;
using Jhoose.Security.Core.Provider;
using System.Threading.Tasks;
using Jhoose.Security.Authorization;
using Jhoose.Security.Core.Repository;

namespace Jhoose.Security.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JhooseController : ControllerBase
    {
        private readonly ICspProvider cspProvider;
        private readonly IResponseHeadersProvider responseHeaderProvider;
        private readonly ICacheManager cache;

        private readonly ILogger<JhooseController> logger;

        public JhooseController(ICspProvider cspProvider,
            IResponseHeadersProvider responseHeaderProvider,
            ICacheManager cache,
            ILogger<JhooseController> logger)
        {
            this.cspProvider = cspProvider;
            this.responseHeaderProvider = responseHeaderProvider;
            this.cache = cache;
            this.logger = logger;
        }

        public class HeaderRequest
        {
            public string Nonce { get; set; } = string.Empty;
        }

        private static JsonSerializerSettings jsonSerializerSettings =
            new() { ContractResolver = new CamelCasePropertyNamesContractResolver() };

        [ApiKeyAuthorization]
        [HttpPost]
        [Route("headers")]
        public async Task<ActionResult> Headers(            
            [FromBody] HeaderRequest headerRequest)
        {
            string? json = null;

            try
            {
                await Task.Run(() =>
                {
                    var headers = this.GetHeaders().ToList();
                    headers.AddRange(this.GetContentSecurityPolicy(headerRequest.Nonce));

                    json = JsonConvert.SerializeObject(headers, jsonSerializerSettings);
                });

                return Content(json ?? "[]", "application/json");
            }
            catch (Exception e)
            {
                this.logger.LogError(e, "Error getting headers/csp");
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        private IEnumerable<KeyValuePair<string, string>> GetHeaders()
        {
            var headerValues = cache.Get<List<ResponseHeader>>(Core.Constants.ResponseHeadersCacheKey,
                () => responseHeaderProvider.ResponseHeaders().ToList(), new TimeSpan(1, 0, 0));
            var enabledHeaders = headerValues.Where(h => h.Enabled);

            foreach (var header in enabledHeaders)
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
                    () => cspProvider.PolicyHeaders().ToList(), new TimeSpan(1, 0, 0));

                foreach (var header in headerValues)
                {
                    header.NonceValue = nonce;
                    yield return new KeyValuePair<string, string>(header.Name, header.Value);
                }
            }
        }
    }
}