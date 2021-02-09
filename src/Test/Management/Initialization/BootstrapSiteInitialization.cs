using EPiServer;
using EPiServer.Framework;
using EPiServer.Framework.Initialization;
using EPiServer.ServiceLocation;
using Test.ContentDomain;

namespace Management.Initialization
{

    [InitializableModule]
    [ModuleDependency(typeof(EPiServer.Web.InitializationModule))]
    public class BootstrapSiteInitialization : IInitializableModule
    {
        private bool _eventAttached;

        public void Initialize(InitializationEngine context)
        {
            if (!_eventAttached)
            {
                //var b = new BootstrapData(ServiceLocator.Current.GetInstance<IContentRepository>());
                //b.Run();

                _eventAttached = true;
            }
        }

        public void Uninitialize(InitializationEngine context)
        {

        }
    }
}