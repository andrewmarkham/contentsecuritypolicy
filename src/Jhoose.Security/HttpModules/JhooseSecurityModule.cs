#if NET461

using System;
using System.Collections.Generic;
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
 
        }
    }
}
#endif
