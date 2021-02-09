using System.ComponentModel.DataAnnotations;
using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.DataAnnotations;
using EPiServer.Web;

namespace Test.ContentDomain.Models.Pages
{
    [ContentType(
        GUID = "19671657-B684-4D95-A61F-8DD4FE60D559")]
    public class HomePage : PageData
    {
       [Display(
            GroupName = SystemTabNames.Content,
            Order = 10)]
        [CultureSpecific]
        public virtual string Heading { get; set; }

        [Display(
            GroupName = SystemTabNames.Content,
            Order = 20)]
        [CultureSpecific]
        public virtual ContentArea MainContentArea { get; set; }

        [UIHint(UIHint.Image)]
        public virtual ContentReference Logo {get;set;}

        public virtual ContentArea MainContent {get;set;}
    }
}