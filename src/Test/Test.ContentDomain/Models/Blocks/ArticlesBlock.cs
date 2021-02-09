using System.ComponentModel.DataAnnotations;
using EPiServer.Core;
using EPiServer.DataAnnotations;
using EPiServer.Web;

namespace Test.ContentDomain.Models.Blocks
{
    [ContentType(GUID = "d61e0e0d-b901-4969-9596-0d803062078d")]
    public class ArticlesBlock : BlockData
    {
        public virtual ContentReference ArticleRoot { get; set; }
    }
}