#if NET461
using EPiServer.Framework;
using EPiServer.Framework.Initialization;
using EPiServer.ServiceLocation;
using Jhoose.Security.Core.Provider;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Jhoose.Security.Initilization
{
    [InitializableModule]
    [ModuleDependency(typeof(EPiServer.Web.InitializationModule))]
    public class JhooseSecurityInitilizationModule : IConfigurableModule
    {
        private bool _eventAttached;
        private ICspProvider cspProvider;

        public void ConfigureContainer(ServiceConfigurationContext context)
        {
            this.cspProvider = context.StructureMap().GetInstance<ICspProvider>();
        }

        public void Initialize(InitializationEngine context)
        {
            if (!_eventAttached)
            {
                this.cspProvider?.Initialize();
                _eventAttached = true;
            }
        }

        public void Uninitialize(InitializationEngine context)
        {
        }
    }
}
#endif
