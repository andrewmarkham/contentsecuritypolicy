using System.Collections;
using System.Collections.Generic;
using Jhoose.Security.DependencyInjection;
using Microsoft.AspNetCore.Http;
using NUnit.Framework;

namespace Jhoose.Security.Tests.DependencyInjection
{
    [TestFixture]
    public class SecurityExtensions_Tests
    {
        [TestCaseSource(typeof(MyDataClass), nameof(MyDataClass.TestCases))]
        public bool ValidPath_Tests(string path)
        {
            //Arrange
            var context = new DefaultHttpContext()
            {

            };

            var exclusionPaths = new List<string>()
            {
                "/episerver",
                "/admin"
            };

            context.Request.Path = path;

            return SecurityExtensions.IsValidPath(context, exclusionPaths);
        }
    }


    public class MyDataClass
    {
        public static IEnumerable TestCases
        {
            get
            {
                yield return new TestCaseData("/episerver").Returns(false);
                yield return new TestCaseData("/episerver/").Returns(false);
                yield return new TestCaseData("/episerver/cms/").Returns(false);
                yield return new TestCaseData("/EPISERVER").Returns(false);
                yield return new TestCaseData("/").Returns(true);
                yield return new TestCaseData("/articles").Returns(true);
                yield return new TestCaseData("/admin/").Returns(false);
            }
        }
    }
}