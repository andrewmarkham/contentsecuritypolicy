#if NET461_OR_GREATER

using EPiServer.ServiceLocation;
using Jhoose.Security.Configuration;
using Jhoose.Security.DependencyInjection;
using Jhoose.Security.Services;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;


using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Jhoose.Security.HttpModules
{
    public class JhooseSecurityModule : IHttpModule
    {
        public void Dispose()
        {
        }

        public void Init(HttpApplication context)
        {
            context.EndRequest += Context_EndRequest;
        }

        private void Context_EndRequest(object sender, EventArgs e)
        {
            HttpContext context = ((HttpApplication)sender).Context;
            HttpResponse httpResponse = context?.Response;
            HttpRequest httpRequest = context?.Request;;

            var securityOptions = ConfigurationManager.GetSection("JhooseSecurity/Options") as OptionsSection;
            var securityHeaders = ConfigurationManager.GetSection("JhooseSecurity/Headers") as HeadersSection;

            IJhooseSecurityService securityService = ServiceLocator.Current.GetInstance<IJhooseSecurityService>();  

            if (httpRequest != null)
            {
                var exclusinPaths = securityOptions.ExclusionPaths?
                                                    .OfType<ExcludeElement>()?
                                                    .Select(x => x.Path) ?? Enumerable.Empty<string>();

                var isValidPath = SecurityExtensions.IsValidPath(httpRequest, exclusinPaths);

                if (httpResponse != null && !httpResponse.HeadersWritten && isValidPath)
                {
                    securityService.AddContentSecurityPolicy(httpResponse);
                    securityService.AddHeaders(httpResponse, securityHeaders.Headers);
                }

                if (securityOptions.HttpsRedirection)
                {
                    if (!httpRequest.IsSecureConnection)
                    {
                        var url = httpRequest.Url.AbsoluteUri;;
                        httpResponse.Redirect(url.Replace("http://", "https://"));
                    }
                }
            }
        }
    }
}
#endif
