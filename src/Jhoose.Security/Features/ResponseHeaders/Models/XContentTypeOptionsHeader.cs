namespace Jhoose.Security.Features.ResponseHeaders.Models;

public class XContentTypeOptionsHeader : ResponseHeader
{
    public override string Name => "X-Content-Type-Options";
    public override string Value => "nosniff";
}