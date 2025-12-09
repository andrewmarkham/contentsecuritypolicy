using Jhoose.Security.Features.CSP.Provider;

using Microsoft.AspNetCore.Razor.TagHelpers;

namespace Jhoose.Security.TagHelpers;

[HtmlTargetElement("script", Attributes = "nonce")]
[HtmlTargetElement("style", Attributes = "nonce")]
[HtmlTargetElement("link", Attributes = "nonce")]
public class CspTagHelper : TagHelper
{
    private readonly ICspProvider provider;
    public CspTagHelper(ICspProvider provider)
    {
        this.provider = provider;
    }
    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        output.Attributes.SetAttribute("nonce", this.provider.GenerateNonce());
    }
}