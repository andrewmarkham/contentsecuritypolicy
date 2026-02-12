using System;
using System.Text;
using System.Text.Json.Serialization;

using Jhoose.Security.Features.Core.Model;

namespace Jhoose.Security.Features.CSP.Models;

public class CspPolicy  : ISitePolicy
{
    public CspPolicy()
    {
        this.Id = Guid.NewGuid();
        this.Site = string.Empty;
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

    public string Site { get; set; }
    public int Order { get; set; }

    public CspPolicyLevel Level { get; set; }
    public string PolicyName { get; set; }
    public bool ReportOnly { get; set; }

    public SandboxOptions? SandboxOptions { get; set; }

    public CspOptions? Options { get; set; }

    public SchemaSource? SchemaSource { get; set; }

    public string Value { get; set; }

    [JsonIgnore]
    public string SummaryText { get; set; }
    public string GroupingKey => this.PolicyName;

    public override string ToString()
    {
        var sb = new StringBuilder();

        if ((this.Options?.HasOptions ?? false) |
            (this.SchemaSource?.HasSchemaSource ?? false) |
            (this.SandboxOptions?.Enabled ?? false) | !string.IsNullOrEmpty(this.Value))
        {
            sb.Append(this.PolicyName).Append(' ');

            sb.Append(this.Options?.ToString());

            if (!this.Options?.None ?? false)
            {
                sb.Append(this.SchemaSource?.ToString());
                sb.Append(this.SandboxOptions?.ToString());

                // Use Span to avoid creating intermediate string allocation
                var valueSpan = this.Value.AsSpan();
                if (valueSpan.Contains("\r\n".AsSpan(), StringComparison.InvariantCulture))
                {
                    valueSpan.ToString().Replace("\r\n", " ");
                    sb.Append(valueSpan.ToString().Replace("\r\n", " ")).Append("; ");
                }
                else if (valueSpan.Contains('\n'))
                {
                    var replaced = valueSpan.ToString().Replace("\n", " ");
                    sb.Append(replaced).Append("; ");
                }
                else 
                {
                    sb.Append(this.Value).Append("; ");
                }
            }
            else
            {
                sb.Append("; ");
            }
        }

        return sb.ToString();
    }
}