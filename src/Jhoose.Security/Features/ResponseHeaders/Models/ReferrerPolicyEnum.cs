namespace Jhoose.Security.Features.ResponseHeaders.Models;

public enum ReferrerPolicyEnum
{
    NoReferrer,
    NoReferrerWhenDownGrade,
    Origin,
    OriginWhenCrossOrigin,
    SameOrigin,
    StrictOrigin,
    StrictOriginWhenCrossOrigin,
    UnsafeUrl
}