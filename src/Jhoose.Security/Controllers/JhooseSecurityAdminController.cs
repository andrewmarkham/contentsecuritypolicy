using Jhoose.Security.Core.Repository;

#if NET5_0_OR_GREATER
    using Microsoft.AspNetCore.Mvc;
#else
    using System.Web.Mvc;
#endif

namespace Jhoose.Security.Controllers
{
    public class JhooseSecurityAdminController : Controller
    {
        private readonly ICspPolicyRepository policyRepository;
        
        public JhooseSecurityAdminController(ICspPolicyRepository policyRepository )
        {
            this.policyRepository = policyRepository;
        }

        public ActionResult Index(){
            this.policyRepository.Bootstrap();
            return View();
        }
    }
}