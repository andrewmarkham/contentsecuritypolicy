using Bogus;
using EPiServer;
using EPiServer.Core;
using Test.ContentDomain.Models.Pages;
using System.Linq;
using System;
using Test.ContentDomain.Models.Media;
using EPiServer.Licensing.Services;
using EPiServer.Web;
using EPiServer.Framework.Blobs;
using EPiServer.DataAccess;
using EPiServer.Security;
using System.IO;

namespace Test.ContentDomain
{
    public class BootstrapData
    {
        private readonly IContentRepository contentRepository;
        private readonly ISiteDefinitionResolver siteDefinitionResolver;

        private readonly IBlobFactory blobFactory;
        private readonly ContentReference assetsFolder;

        public BootstrapData(IContentRepository contentRepository, 
                             ISiteDefinitionResolver siteDefinitionResolver,
                             IBlobFactory blobFactory)
        {
            this.contentRepository = contentRepository;
            this.siteDefinitionResolver = siteDefinitionResolver;
            this.blobFactory = blobFactory;

            this.assetsFolder = this.siteDefinitionResolver.GetByContent(ContentReference.StartPage, true).SiteAssetsRoot;
        }

        public void Run() {

            this.contentRepository.DeleteChildren(ContentReference.StartPage, true, EPiServer.Security.AccessLevel.FullAccess);
            this.contentRepository.DeleteChildren(this.assetsFolder , true, EPiServer.Security.AccessLevel.FullAccess);

            var articleFaker = new Faker<ArticlePage>()
                                    .RuleFor(p => p.Name, f => f.Lorem.Slug())
                                    .RuleFor(p => p.Heading, f => f.Hacker.Phrase())
                                    .RuleFor(p => p.HeadingImage, f => LoadImage(f.Image.PlaceImgUrl(1024, 768 ,"tech"), f.System.FileName("jpg")))
                                    .RuleFor(p => p.ArticleDate, f => f.Date.Past())
                                    .RuleFor(p => p.Strapline, f => f.Lorem.Sentence())
                                    .RuleFor(p => p.Body, f =>  new XhtmlString(string.Concat(f.Lorem.Paragraphs(3,8).Split(Environment.NewLine).Select(l => $"<p>{l}</p>"))))
                                    .RuleFor(p => p.Summary, f => f.Lorem.Paragraph());
            
            for (int i = 0; i < 10; i++)
            {
                var page = this.contentRepository.GetDefault<ArticlePage>(ContentReference.StartPage);
                
                articleFaker.Populate(page);

                var result = this.contentRepository.Save(page, EPiServer.DataAccess.SaveAction.Publish, EPiServer.Security.AccessLevel.FullAccess);
            }
        }

        private ContentReference LoadImage(string imageUrl, string filename)
        {
            ContentReference imageRef = ContentReference.EmptyReference;

            using (System.Net.WebClient wc = new System.Net.WebClient())
            {
                //wc.Headers.Add("Cookie: Authentication=user"); // add a cookie header to the request
                try
                {
                    byte[] data = wc.DownloadData(imageUrl); // could add file extension here
                    
                    ImageFile imageFile = this.contentRepository.GetDefault<ImageFile>(this.assetsFolder);

                    
                    var fi = new FileInfo(filename);
                    
                    imageFile.Name = fi.Name;
                    Blob golfCourseBlob = this.blobFactory.CreateBlob(imageFile.BinaryDataContainer, fi.Extension);
                    
                    golfCourseBlob.WriteAllBytes(data);
                    
                    imageFile.BinaryData = golfCourseBlob;

                    imageRef = this.contentRepository.Save(imageFile, SaveAction.Publish, AccessLevel.NoAccess);
                }
                catch (System.Exception ex)
                {
                    // check exception object for the error
                }

                return imageRef;
            }
        }
    }
}