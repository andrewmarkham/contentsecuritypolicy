#if NET5_0_OR_GREATER
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Authorization;
#else

using System.Web.Http;
using System.Net;
using EPiServer.ServiceLocation;
using System.Web.Http.Description;
#endif

using System.Collections.Generic;


using Jhoose.Security.Core.Repository;
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Models.CSP;

namespace Jhoose.Security.Controllers
{
    [Authorize]

    //
#if NET461_OR_GREATER
    [RoutePrefix("api/csp")]
#else
    [Route("api/[controller]")]
#endif
#if NET5_0_OR_GREATER
    [ApiController]
    public class CspController : ControllerBase
#else
    public class CspController : ApiController
#endif
    {
        private readonly ICspPolicyRepository policyRepository;

#if NET461_OR_GREATER
        public CspController()
        {
            this.policyRepository = ServiceLocator.Current.GetInstance<ICspPolicyRepository>();
        }

#endif
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
        [Route("")]
        [ResponseType(typeof(List<CspPolicy>))]
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
        [Route("")]
        [ResponseType(typeof(CspPolicy))]
        public IHttpActionResult Update(CspPolicy policy)
#endif
        {
            return Ok(this.policyRepository.Update(policy));
        }


        [HttpGet]
#if NET5_0_OR_GREATER
        [Route("settings")]
        [ProducesResponseType(typeof(CspSettings),StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CspSettings),StatusCodes.Status500InternalServerError)]
        public ActionResult<CspSettings> Settings()
#else
        [Route("settings")]
        [ResponseType(typeof(CspSettings))]
        public IHttpActionResult Settings()
#endif
        {
            return Ok(this.policyRepository.Settings());
        }

        [HttpPost]

#if NET5_0_OR_GREATER
        [Route("settings")]
        [ProducesResponseType(typeof(CspSettings),StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CspSettings),StatusCodes.Status500InternalServerError)]
        public ActionResult<CspSettings> Settings(CspSettings settings)
#else
        [Route("settings")]
        [ResponseType(typeof(CspSettings))]
        public IHttpActionResult Settings(CspSettings settings)
#endif

        {
            var result = this.policyRepository.SaveSettings(settings);

            if (result)
                return Ok(settings);
            else
#if NET5_0_OR_GREATER
                return StatusCode(StatusCodes.Status500InternalServerError);
#else
                return StatusCode(HttpStatusCode.InternalServerError);
#endif
        }
    }
}