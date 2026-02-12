using Jhoose.Security.Features.Core.Services;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace Jhoose.Security.TagHelpers;

[HtmlTargetElement("script", Attributes = "nonce")]
[HtmlTargetElement("style", Attributes = "nonce")]
[HtmlTargetElement("link", Attributes = "nonce")]
public class CspTagHelper(INonceService nonceService) : TagHelper
{
    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        output.Attributes.SetAttribute("nonce", nonceService.GenerateNonce());
    }
}