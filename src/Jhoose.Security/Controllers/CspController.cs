#if NET5_0_OR_GREATER
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Authorization;
#else

using System.Web.Http;
using System.Net;

#endif

using System.Collections.Generic;


using Jhoose.Security.Core.Repository;
using Jhoose.Security.Core.Models;


namespace Jhoose.Security.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
#if NET5_0_OR_GREATER
    [ApiController]
    public class CspController : ControllerBase
#else
    public class CspController : ApiController
#endif
    {
        private readonly ICspPolicyRepository policyRepository;

        public CspController(ICspPolicyRepository policyRepository)
        {
            this.policyRepository = policyRepository;
        }

        [HttpGet]
#if NET5_0_OR_GREATER
        [ProducesResponseType(typeof(List<CspPolicy>),StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(List<CspPolicy>),StatusCodes.Status500InternalServerError)]
        public ActionResult<List<CspPolicy>> List()
#else
        public IHttpActionResult List()
#endif

        {
            return Ok(this.policyRepository.List());
        }

        [HttpPost]
#if NET5_0_OR_GREATER
        [ProducesResponseType(typeof(CspPolicy),StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CspPolicy),StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(CspPolicy),StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(CspPolicy),StatusCodes.Status500InternalServerError)]

        public ActionResult<CspPolicy> Update(CspPolicy policy)
#else
        public IHttpActionResult Update(CspPolicy policy)
#endif
        {
            return Ok(this.policyRepository.Update(policy)) ;
        }


        [HttpGet]
        [Route("settings")]
#if NET5_0_OR_GREATER

        [ProducesResponseType(typeof(CspSettings),StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CspSettings),StatusCodes.Status500InternalServerError)]
        public ActionResult<CspSettings> Settings()
#else
        public IHttpActionResult Settings()
#endif
        {
            return Ok(this.policyRepository.Settings());
        }

        [HttpPost]
        [Route("settings")]
#if NET5_0_OR_GREATER

        [ProducesResponseType(typeof(CspSettings),StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CspSettings),StatusCodes.Status500InternalServerError)]
        public ActionResult<CspSettings> Settings(CspSettings settings)
#else
        public IHttpActionResult Settings(CspSettings settings)
#endif

        {
            return Ok(this.policyRepository.SaveSettings(settings));
        }
    }
}