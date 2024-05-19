//using Newtonsoft.Json;

using System.Text.Json.Serialization;

namespace Jhoose.Security.Reporting.Models
{
    public class ReportTo
    {
        [JsonConstructor]
        public ReportTo(
            int age,
            string type,
            string url,
            string userAgent,
            ReportToBody body
        )
        {
            Age = age;
            Type = type;
            Url = url;
            UserAgent = userAgent;
            Body = body;
        }

        [JsonPropertyName("age")]
        public int Age { get; }

        [JsonPropertyName("type")]
        public string Type { get; }

        [JsonPropertyName("url")]
        public string Url { get; }

        [JsonPropertyName("user_agent")]
        public string UserAgent { get; set; }

        [JsonPropertyName("body")]
        public ReportToBody Body { get; }
    }
}