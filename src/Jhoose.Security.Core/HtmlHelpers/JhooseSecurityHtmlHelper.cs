#if NET461_OR_GREATER
using EPiServer.ServiceLocation;
using Jhoose.Security.Core.Provider;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;
using System.Web;

namespace Jhoose.Security.Core.HtmlHelpers
{
    public static class JhooseSecurityHtmlHelper
    {
        public static MvcHtmlString AddNonce(this HtmlHelper htmlHelper)
        {
            ICspProvider provider = ServiceLocator.Current.GetInstance<ICspProvider>();

            var htmlString =  MvcHtmlString.Create($"nonce=\"{provider.GenerateNonce()}\"");

            return htmlString;
        }
    }
}
#endif