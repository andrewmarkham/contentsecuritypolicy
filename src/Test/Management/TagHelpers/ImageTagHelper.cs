using System;
using System.Threading.Tasks;
using EPiServer;
using EPiServer.Core;
using EPiServer.Web.Routing;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace Management.TagHelpers
{
    [HtmlTargetElement("picture", TagStructure = TagStructure.NormalOrSelfClosing)] 
    public class ImageTagHelper : TagHelper
    {
        private readonly IContentRepository contentRepository;
        private readonly IUrlResolver urlResolver;

        public ImageTagHelper(IContentRepository contentRepository, IUrlResolver urlResolver)
        {
            this.contentRepository = contentRepository;  
            this.urlResolver = urlResolver;     
        }

        public ContentReference ImageReference {get;set;}
        
        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            var (url, altTag) = GetImageDetails();
            
            output.TagName = "picture";
            output.Content.SetHtmlContent($"<img src='{url}' alt='{altTag}' />");

            //return Task.CompletedTask;
        }

        private (string url, string altTag) GetImageDetails()
        {
            if (this.contentRepository.TryGet<ImageData>(this.ImageReference, out var imageData))
            {
                var url = this.urlResolver.GetUrl(imageData.ContentLink);
                var altText = imageData.Name;

                return (url, altText);
            }

            return (string.Empty, string.Empty);
        }
    }
}