using System.Collections;
using System.Collections.Generic;

using Jhoose.Security.Configuration;
using Jhoose.Security.Middleware;

using Microsoft.AspNetCore.Http;

using NUnit.Framework;

namespace Jhoose.Security.Tests.Middleware
{
    [TestFixture]
    public class IpRestrictionMiddleware_Tests
    {
        private static readonly List<string> ExclusionPaths = new() { "/episerver", "/admin" };

        private static bool IsInScope(string path, IpRestrictionScope scope)
        {
            var context = new DefaultHttpContext();
            context.Request.Path = path;

            var options = new JhooseSecurityOptions
            {
                IpRestrictionScope = scope,
                ExclusionPaths = ExclusionPaths,
            };

            return IpRestrictionMiddleware.IsInScope(context.Request, options);
        }

        [TestCaseSource(typeof(PublicSiteTestDataClass), nameof(PublicSiteTestDataClass.TestCases))]
        public bool PublicSiteScope_Tests(string path) => IsInScope(path, IpRestrictionScope.PublicSite);

        [TestCaseSource(typeof(CmsSiteTestDataClass), nameof(CmsSiteTestDataClass.TestCases))]
        public bool CmsSiteScope_Tests(string path) => IsInScope(path, IpRestrictionScope.CmsSite);

        [TestCaseSource(typeof(BothTestDataClass), nameof(BothTestDataClass.TestCases))]
        public bool BothScope_Tests(string path) => IsInScope(path, IpRestrictionScope.Both);

        [TestCaseSource(typeof(OffTestDataClass), nameof(OffTestDataClass.TestCases))]
        public bool OffScope_Tests(string path) => IsInScope(path, IpRestrictionScope.Off);

        public class PublicSiteTestDataClass
        {
            public static IEnumerable TestCases
            {
                get
                {
                    yield return new TestCaseData("/").Returns(true);
                    yield return new TestCaseData("/articles").Returns(true);
                    yield return new TestCaseData("/episerver").Returns(false);
                    yield return new TestCaseData("/episerver/cms").Returns(false);
                    yield return new TestCaseData("/admin/").Returns(false);
                }
            }
        }

        public class CmsSiteTestDataClass
        {
            public static IEnumerable TestCases
            {
                get
                {
                    yield return new TestCaseData("/").Returns(false);
                    yield return new TestCaseData("/articles").Returns(false);
                    yield return new TestCaseData("/episerver").Returns(true);
                    yield return new TestCaseData("/episerver/cms").Returns(true);
                    yield return new TestCaseData("/admin/").Returns(true);
                }
            }
        }

        public class BothTestDataClass
        {
            public static IEnumerable TestCases
            {
                get
                {
                    yield return new TestCaseData("/").Returns(true);
                    yield return new TestCaseData("/articles").Returns(true);
                    yield return new TestCaseData("/episerver").Returns(true);
                    yield return new TestCaseData("/admin/").Returns(true);
                }
            }
        }

        public class OffTestDataClass
        {
            public static IEnumerable TestCases
            {
                get
                {
                    yield return new TestCaseData("/").Returns(false);
                    yield return new TestCaseData("/articles").Returns(false);
                    yield return new TestCaseData("/episerver").Returns(false);
                    yield return new TestCaseData("/admin/").Returns(false);
                }
            }
        }
    }
}
