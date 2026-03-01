using System;
using System.Collections.Generic;
using System.Text;

using Jhoose.Security.Features.Core.Model;

namespace Jhoose.Security.Features.Permissions.Models;
/// <summary>
/// Represents a permission policy.
/// </summary>
/// <param name="Id"></param>
/// <param name="Key"></param>
/// <param name="Mode"></param>
/// <param name="Scope"></param>
/// <param name="Allowlist"></param>
/// <param name="Site"></param>
public record PermissionPolicy(Guid Id, string Key, string? Mode, string? Scope, List<string> Allowlist, string Site) : ISitePolicy
{
    /// <summary>
    /// Initializes a new instance of the <see cref="PermissionPolicy"/> class.
    /// </summary>
    public PermissionPolicy() : this(Guid.NewGuid(), string.Empty, string.Empty, string.Empty, [], string.Empty)
    {
    }

    public string Site
    {
        get => string.IsNullOrEmpty(field) ? "*" : field;
        set => field = value ?? string.Empty;
    }
    
    public string GroupingKey => this.Key;
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
                if (this.Scope=="all")
                {
                    sb.Append("=(*)");
                } 
                else
                {
                    sb.Append("=(self");
                    if (this.Allowlist != null && this.Allowlist.Count > 0)
                    {
                        sb.Append(' ').AppendJoin(' ',this.Allowlist);
                    }
                    sb.Append(')');
                }
                break;
        }
        
        return sb.ToString();
    }
}
