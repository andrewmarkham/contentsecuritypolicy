using System.ComponentModel.DataAnnotations;
using EPiServer.Core;
using EPiServer.DataAnnotations;
using EPiServer.Framework.DataAnnotations;

namespace DemoSite.Models.Media
{

    [ContentType(DisplayName = "ImageMedia", GUID = "2d5fceb1-bc2b-484a-be99-0e25a44bcd6b", Description = "Used for images.")]
    [MediaDescriptor(ExtensionString = "gif,png,jpg")]
    public class ImageFile : ImageData
    {
        [CultureSpecific]
        [Editable(true)]
        [Display(
      Name = "Description",
      Description = "Add a description of the content.",
      Order = 1)]
        public virtual string Description { get; set; }
    }
}