using Jhoose.Security.Authorization;
using Jhoose.Security.Core.Repository;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace Jhoose.Security.Controllers.Api
{
    [Authorize(Policy = Constants.PolicyName)]
    public class JhooseSecurityAdminController : Controller
    {
        private readonly ICspPolicyRepository policyRepository;

        public JhooseSecurityAdminController(ICspPolicyRepository policyRepository)
        {
            this.policyRepository = policyRepository;
        }

        public ActionResult Index()
        {
            this.policyRepository.Bootstrap();
            return View();
        }
    }
}