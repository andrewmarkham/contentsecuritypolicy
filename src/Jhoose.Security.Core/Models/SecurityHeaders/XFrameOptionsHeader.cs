namespace Jhoose.Security.Core.Models.SecurityHeaders;

public class XFrameOptionsHeader : ResponseHeader
{
    public override string Name => "X-Frame-Options";

    private string DetermineValue(XFrameOptionsEnum mode, string domain)
    {
        switch (mode)
        {
            case XFrameOptionsEnum.Deny:
                return "deny";
            case XFrameOptionsEnum.SameOrigin:
                return "sameorigin";
            case XFrameOptionsEnum.AllowFrom:
                return $"allow-from: {domain}";
            default:
                return "deny";
        }
    }

    public override string Value => DetermineValue(Mode, Domain);

    public XFrameOptionsEnum Mode { get; set; } = XFrameOptionsEnum.Deny;
    public string Domain { get; set; } = string.Empty;
}