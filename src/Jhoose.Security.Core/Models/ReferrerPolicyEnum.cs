namespace Jhoose.Security.Core.Models
{
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
}