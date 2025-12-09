using System.Collections.Generic;
using System.Text;

namespace Jhoose.Security.Features.Permissions.Models;
/// <summary>
/// Represents a permission policy.
/// </summary>
/// <param name="Key"></param>
/// <param name="Mode"></param>
/// <param name="Scope"></param>
/// <param name="Allowlist"></param>
public record PermissionPolicy(string Key, string? Mode, string? Scope, List<string> Allowlist)
{
    /// <summary>
    /// Initializes a new instance of the <see cref="PermissionPolicy"/> class.
    /// </summary>
    public PermissionPolicy() : this(string.Empty, string.Empty, string.Empty, [])
    {
    }

    public override string ToString()
    {

        var sb = new StringBuilder();

        sb.Append(this.Key);

        switch (this.Mode)
        {
            case "default":
                return string.Empty;
            case "disabled":
                sb.Append("=()");
                break;
            case "enabled":
            case "report":
                sb.Append("=(self");
                if (this.Allowlist != null && this.Allowlist.Count > 0)
                {
                    sb.Append(' ').AppendJoin(' ',this.Allowlist);
                }
                sb.Append(')');
                break;
        }
        
        return sb.ToString();
    }
}
