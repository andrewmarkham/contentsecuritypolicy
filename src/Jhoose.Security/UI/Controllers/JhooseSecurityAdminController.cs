using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace Jhoose.Security.UI.Controllers;

[Authorize(Policy = Constants.Authentication.PolicyName)]
public class JhooseSecurityAdminController : Controller
{
    public JhooseSecurityAdminController()
    {
    }

    public ActionResult Index()
    {
        return View();
    }
}