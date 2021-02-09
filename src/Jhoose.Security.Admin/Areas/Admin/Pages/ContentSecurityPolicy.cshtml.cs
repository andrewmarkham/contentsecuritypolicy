using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EPiServer;
using EPiServer.Framework.Blobs;
using EPiServer.ServiceLocation;
using EPiServer.Web;
using Jhoose.Security.Core.Repository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Jhoose.Security.Admin.Pages
{
    public class ContentSecurityPolicy : PageModel
    {
        private readonly ICspPolicyRepository policyRepository;
        
        public ContentSecurityPolicy(ICspPolicyRepository policyRepository )
        {
            this.policyRepository = policyRepository;
        }

        public void OnGet()
        {
            this.policyRepository.Bootstrap();
        }
    }
}
