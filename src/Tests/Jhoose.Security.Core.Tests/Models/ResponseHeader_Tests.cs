using System.Collections;
using System.Collections.Generic;
using NUnit.Framework;
using Jhoose.Security.Core.Models;

namespace Jhoose.Security.Core.Tests
{
    public class ResponseHeader_Tests
    {
        [TestFixture]
        public class SecurityExtensions_Tests
        {
            [TestCaseSource(typeof(ResponseHeaderTestDataClass), nameof(ResponseHeaderTestDataClass.TestCases))]
            public string ValidValue_Tests(ResponseHeader header)
            {

                return header.Value;
            }
        }

        public class ResponseHeaderTestDataClass
        {
            public static IEnumerable TestCases
            {
                get
                {
                    yield return new TestCaseData(new CrossOriginEmbedderPolicyHeader()).Returns("require-corp");
                    yield return new TestCaseData(new CrossOriginEmbedderPolicyHeader{ Mode = CrossOriginEmbedderPolicyEnum.UnSafeNone }).Returns("unsafe-none");

                    yield return new TestCaseData(new CrossOriginOpenerPolicyHeader()).Returns("same-origin");
                    yield return new TestCaseData(new CrossOriginOpenerPolicyHeader{ Mode = CrossOriginOpenerPolicyEnum.UnSafeNone}).Returns("unsafe-none");
                    yield return new TestCaseData(new CrossOriginOpenerPolicyHeader{ Mode = CrossOriginOpenerPolicyEnum.SameOriginAllowPopups}).Returns("same-origin-allow-popups");

                    yield return new TestCaseData(new CrossOriginResourcePolicyHeader()).Returns("same-origin");
                    yield return new TestCaseData(new CrossOriginResourcePolicyHeader{ Mode = CrossOriginResourcePolicyEnum.SameSite}).Returns("same-site");
                    yield return new TestCaseData(new CrossOriginResourcePolicyHeader{ Mode = CrossOriginResourcePolicyEnum.CrossOrigin}).Returns("cross-origin");

                    yield return new TestCaseData(new ReferrerPolicyHeader()).Returns("no-referrer");

                    yield return new TestCaseData(new ReferrerPolicyHeader{Mode = ReferrerPolicyEnum.NoReferrerWhenDownGrade}).Returns("no-referrer-when-downgrade");
                    yield return new TestCaseData(new ReferrerPolicyHeader{Mode = ReferrerPolicyEnum.Origin}).Returns("origin");
                    yield return new TestCaseData(new ReferrerPolicyHeader{Mode = ReferrerPolicyEnum.OriginWhenCrossOrigin}).Returns("origin-when-cross-origin");
                    yield return new TestCaseData(new ReferrerPolicyHeader{Mode = ReferrerPolicyEnum.SameOrigin}).Returns("same-origin");
                    yield return new TestCaseData(new ReferrerPolicyHeader{Mode = ReferrerPolicyEnum.StrictOrigin}).Returns("strict-origin");
                    yield return new TestCaseData(new ReferrerPolicyHeader{Mode = ReferrerPolicyEnum.StrictOriginWhenCrossOrigin}).Returns("strict-origin-when-cross-origin");
                    yield return new TestCaseData(new ReferrerPolicyHeader{Mode = ReferrerPolicyEnum.UnsafeUrl}).Returns("unsafe-url");



                    yield return new TestCaseData(new StrictTransportSecurityHeader()).Returns("max-age=31536000; includeSubDomains");
                    yield return new TestCaseData(new StrictTransportSecurityHeader{ MaxAge = 1, IncludeSubDomains = false}).Returns("max-age=1;");

                    yield return new TestCaseData(new XContentTypeOptionsHeader()).Returns("nosniff");

                    yield return new TestCaseData(new XFrameOptionsHeader()).Returns("deny");
                    yield return new TestCaseData(new XFrameOptionsHeader{ Mode = XFrameOptionsEnum.SameOrigin}).Returns("sameorigin");
                    yield return new TestCaseData(new XFrameOptionsHeader{ Mode = XFrameOptionsEnum.AllowFrom, Domain="bbc.co.uk"}).Returns("allow-from: bbc.co.uk");

                    yield return new TestCaseData(new XPermittedCrossDomainPoliciesHeader()).Returns("none");
                    yield return new TestCaseData(new XPermittedCrossDomainPoliciesHeader{ Mode = XPermittedCrossDomainPoliciesEnum.MasterOnly}).Returns("master-only");
                    yield return new TestCaseData(new XPermittedCrossDomainPoliciesHeader{ Mode = XPermittedCrossDomainPoliciesEnum.ByContentType}).Returns("by-content-type");
                    yield return new TestCaseData(new XPermittedCrossDomainPoliciesHeader{ Mode = XPermittedCrossDomainPoliciesEnum.All}).Returns("all");
                }
            }
        }
    }
}