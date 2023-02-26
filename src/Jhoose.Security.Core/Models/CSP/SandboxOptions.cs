using System.Text;
#if NET461_OR_GREATER
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
#endif
namespace Jhoose.Security.Core.Models.CSP
{
#if NET461_OR_GREATER
    [JsonObject(NamingStrategyType = typeof(CamelCaseNamingStrategy))]
#endif
    public class SandboxOptions
    {
        public SandboxOptions()
        {
            this.Enabled = false;
            this.AllowForms = false;
            this.AllowSameOrigin = false;
            this.AllowScripts = false;
            this.AllowPopups = false;
            this.AllowModals = false;
            this.AllowOrientationLock = false;
            this.AllowPointerLock = false;
            this.AllowPresentation = false;
            this.AllowPopupsToEscapeSandbox = false;
            this.AllowTopNavigation = false;
            this.AllowTopNavigationByUserActivation = false;
        }

        public bool Enabled { get; set; }
        public bool AllowForms { get; set; }
        public bool AllowSameOrigin { get; set; }
        public bool AllowScripts { get; set; }
        public bool AllowPopups { get; set; }
        public bool AllowModals { get; set; }
        public bool AllowOrientationLock { get; set; }
        public bool AllowPointerLock { get; set; }
        public bool AllowPresentation { get; set; }
        public bool AllowPopupsToEscapeSandbox { get; set; }
        public bool AllowTopNavigation { get; set; }
        public bool AllowTopNavigationByUserActivation { get; set; }


        public override string ToString()
        {
            var sb = new StringBuilder();

            if (this.Enabled)
            {
                if (this.AllowForms) sb.Append("allow-forms ");
                if (this.AllowSameOrigin) sb.Append("allow-same-origin ");

                if (this.AllowScripts) sb.Append("allow-scripts ");
                if (this.AllowPopups) sb.Append("allow-popups ");
                if (this.AllowModals) sb.Append("allow-modals ");
                if (this.AllowOrientationLock) sb.Append("allow-orientation-lock ");

                if (this.AllowPointerLock) sb.Append("allow-pointer-lock ");
                if (this.AllowPresentation) sb.Append("allow-presentation ");
                if (this.AllowPopupsToEscapeSandbox) sb.Append("allow-popups-to-escape-sandbox ");
                if (this.AllowTopNavigation) sb.Append("allow-top-navigation ");
                if (this.AllowTopNavigationByUserActivation) sb.Append("allow-top-navigation-by-user-activation ");
            }

            return sb.ToString();
        }
    }
}