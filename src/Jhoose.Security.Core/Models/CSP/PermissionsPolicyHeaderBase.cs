using System.Collections.Generic;
using System.Text;

using Jhoose.Security.Core.Models.Permissions;

namespace Jhoose.Security.Core.Models.CSP;

public abstract class PermissionsPolicyHeaderBase : ResponseHeader
{
    protected readonly CspSettings settings;

    protected readonly string reportUrl;
    protected readonly string reportToUrl;

    protected PermissionsPolicyHeaderBase(CspSettings settings, string host)
    {
        this.settings = settings;

        switch (this.settings.ReportingMode)
        {
            case ReportingMode.Local:
                this.reportUrl = $"{host}api/reporting/";
                this.reportToUrl = $"{host}api/reporting/";
                break;
            case ReportingMode.External:
                this.reportUrl = this.settings.ReportingUrl;
                this.reportToUrl = this.settings.ReportToUrl;
                break;
            default:
                this.reportUrl = string.Empty;
                this.reportToUrl = string.Empty;
                break;
        }
    }

    protected virtual string BuildValue(string reportUrl)
    {
        var sb = new StringBuilder();

        sb.AppendJoin(", ", this.Policies ?? []);

        if (!string.IsNullOrEmpty(this.reportToUrl))
        {
            sb.Append("; report-to=\"permissions-endpoint\"");
        }
        
        return sb.ToString();
    }

    public List<PermissionPolicy>? Policies { get; set; }

    public override string Value => this.BuildValue(this.reportUrl);
}