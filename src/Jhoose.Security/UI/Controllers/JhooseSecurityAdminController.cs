using Jhoose.Security.Features.CSP.Repository;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace Jhoose.Security.UI.Controllers;

[Authorize(Policy = Constants.Authentication.PolicyName)]
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