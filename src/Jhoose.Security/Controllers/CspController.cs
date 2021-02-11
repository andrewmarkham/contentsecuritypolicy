using Microsoft.AspNetCore.Mvc;

using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;

using Jhoose.Security.Core.Repository;
using Jhoose.Security.Core.Models;

namespace Jhoose.Security.Controllers
{

    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class CspController : ControllerBase
    {
        private readonly ICspPolicyRepository policyRepository;

        public CspController(ICspPolicyRepository policyRepository)
        {
            this.policyRepository = policyRepository;
        }

        [HttpGet]
        [ProducesResponseType(typeof(List<CspPolicy>),StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(List<CspPolicy>),StatusCodes.Status500InternalServerError)]
        public ActionResult<List<CspPolicy>> List()
        {
            return Ok(this.policyRepository.List());
        }

        [HttpPost]
        [ProducesResponseType(typeof(CspPolicy),StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CspPolicy),StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(CspPolicy),StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(CspPolicy),StatusCodes.Status500InternalServerError)]
        public ActionResult<CspPolicy> Update(CspPolicy policy)
        {
            return Ok(this.policyRepository.Update(policy)) ;
        }
    }
}