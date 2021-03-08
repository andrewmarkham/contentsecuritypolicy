using System.Collections.Generic;

namespace Jhoose.Security
{
    public class SecurityOptions
    {
        public const string JhooseSecurity = "JhooseSecurity";
        public List<string> ExclusionPaths { get; set; }
    }
}