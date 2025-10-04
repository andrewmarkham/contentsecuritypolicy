using System;
using System.ComponentModel.DataAnnotations;

using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.DataAnnotations;
using EPiServer.Web;

namespace DemoSite.Models.Pages
{
    [ContentType(GUID = "77cd3b4e-a6e0-45de-996f-8fbef7dcc04b")]
    public class ArticlePage : PageData
    {
        [Display(
            GroupName = SystemTabNames.Content,
            Order = 10)]
        [CultureSpecific]
        public virtual string Heading { get; set; }

        [Display(
            GroupName = SystemTabNames.Content,
            Order = 15)]
        [UIHint(UIHint.Image)]
        public virtual ContentReference HeadingImage { get; set; }

        [Display(
            GroupName = SystemTabNames.Content,
            Order = 20)]
        [CultureSpecific]
        public virtual string Strapline { get; set; }

        [Display(
            GroupName = SystemTabNames.Content,
            Order = 30)]
        [CultureSpecific]
        public virtual string Summary { get; set; }

        [Display(
            GroupName = SystemTabNames.Content,
            Order = 40)]
        [CultureSpecific]
        public virtual XhtmlString Body { get; set; }

        [Display(
            GroupName = SystemTabNames.Content,
            Order = 50)]
        [CultureSpecific]
        public virtual DateTime ArticleDate { get; set; }
    }
}