using System.Text;
#if NET461_OR_GREATER
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
#endif
namespace Jhoose.Security.Core.Models.CSP
{
#if NET461_OR_GREATER
    [JsonObject(NamingStrategyType = typeof(CamelCaseNamingStrategy))]
#endif
    public class SchemaSource
    {
        public SchemaSource()
        {
            this.Http = false;
            this.Https = false;

            this.Data = false;
            this.Mediastream = false;
            this.Blob = false;
            this.Filesystem = false;

            this.Ws = false;
            this.Wss = false;
        }

        public bool Http { get; set; }
        public bool Https { get; set; }
        public bool Data { get; set; }
        public bool Mediastream { get; set; }
        public bool Blob { get; set; }
        public bool Filesystem { get; set; }

        public bool Ws { get; set; }
        public bool Wss { get; set; }

        public override string ToString()
        {
            var sb = new StringBuilder();

            if (this.Http) sb.Append("http: ");
            if (this.Https) sb.Append("https: ");

            if (this.Data) sb.Append("data: ");
            if (this.Mediastream) sb.Append("mediastream: ");
            if (this.Blob) sb.Append("blob: ");
            if (this.Filesystem) sb.Append("filesystem: ");

            if (this.Ws) sb.Append("ws: ");
            if (this.Wss) sb.Append("wss: ");

            return sb.ToString();
        }

        public bool HasSchemaSource => this.Http | this.Https | this.Data | this.Mediastream | this.Blob | this.Filesystem | this.Ws | this.Wss;
    }
}