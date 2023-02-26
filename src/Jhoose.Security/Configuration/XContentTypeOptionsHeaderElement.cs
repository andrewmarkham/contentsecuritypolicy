
#if NET461_OR_GREATER
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core.Models.SecurityHeaders;
using System;

namespace Jhoose.Security.Configuration
{
    public class XContentTypeOptionsHeaderElement : ResponseHeaderElement<XContentTypeOptionsHeader>
    {
        public override Lazy<XContentTypeOptionsHeader> InnerHeader => new Lazy<XContentTypeOptionsHeader>(() => new XContentTypeOptionsHeader
        {
            Enabled = this.Enabled
        });
    }
}
#endif

