using System;
using System.Text;
using System.Net;

namespace Jhoose.Security.Core.Models
{
    public class CspPolicy
    {
        public CspPolicy()
        {
            this.Id = Guid.NewGuid();
            this.Order = 1;
            this.Level = CspPolicyLevel.Level1;
            this.ReportOnly = false;
            this.SandboxOptions = null;
            this.Options = null;//new CspOptions();
            this.SchemaSource = null;//new SchemaSource();
            this.PolicyName = string.Empty;
            this.Value = string.Empty;
            this.SummaryText = string.Empty;

        }

        public Guid Id { get; set; }
        public int Order { get; set; }
        public CspPolicyLevel Level { get; set; }
        public string PolicyName { get; set; }
        public bool ReportOnly { get; set; }

        public SandboxOptions SandboxOptions { get; set; }

        public CspOptions Options { get; set; }

        public SchemaSource SchemaSource { get; set; }

        public string Value { get; set; }

        public string SummaryText { get; set; }

        public override string ToString()
        {
            var sb = new StringBuilder();

            if ((this.Options?.HasOptions ?? false) |
                (this.SchemaSource?.HasSchemaSource ?? false) |
                (this.SandboxOptions?.Enabled ?? false) | !string.IsNullOrEmpty(this.Value))
            {
                sb.AppendFormat($"{this.PolicyName} ");

                sb.Append(this.Options?.ToString());
                sb.Append(this.SchemaSource?.ToString());
                sb.Append(this.SandboxOptions?.ToString());

                var value = this.Value.Replace(Environment.NewLine, " ");

                sb.AppendFormat($"{value}; ");
            }

            return sb.ToString();
        }
    }
}