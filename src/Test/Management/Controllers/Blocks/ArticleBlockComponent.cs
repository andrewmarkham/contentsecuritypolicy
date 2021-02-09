using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EPiServer;
using EPiServer.Core;
using EPiServer.Web;
using EPiServer.Web.Mvc;
using Microsoft.AspNetCore.Mvc;
using Test.ContentDomain.Models.Blocks;
using Test.ContentDomain.Models.Pages;

namespace Management.Controllers.Blocks
{    public class ArticleBlockComponent : ViewComponent, IRenderTemplate<ArticlesBlock>, IRenderTemplate 
    //public class ArticleBlockComponent : PartialContentComponent<ArticlesBlock>
    {
        private readonly IContentRepository contentRepository;

        public ArticleBlockComponent(IContentRepository contentRepository)
        {
            this.contentRepository = contentRepository;    
        }

        public IViewComponentResult Invoke(ArticlesBlock currentContent)
        {
            List<ArticlePage> children = null;

            if (currentContent.ArticleRoot != ContentReference.EmptyReference)
            {
                children = this.contentRepository.GetChildren<IContent>(currentContent.ArticleRoot)
                                                .OfType<ArticlePage>()
                                                .ToList();
            }

            return View(children ?? new List<ArticlePage>());
        }
    }
}