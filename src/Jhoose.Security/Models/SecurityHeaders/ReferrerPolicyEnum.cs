namespace Jhoose.Security.Models.SecurityHeaders;

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