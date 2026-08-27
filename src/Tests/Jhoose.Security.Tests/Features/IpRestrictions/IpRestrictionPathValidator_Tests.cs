using System.Collections;

using Jhoose.Security.Features.IpRestrictions;

using NUnit.Framework;

namespace Jhoose.Security.Tests.Features.IpRestrictions
{
    [TestFixture]
    public class IpRestrictionPathValidator_Tests
    {
        [TestCaseSource(typeof(ValidTestDataClass), nameof(ValidTestDataClass.TestCases))]
        public bool IsValid_Valid_Tests(string value) => IpRestrictionPathValidator.IsValid(value);

        [TestCaseSource(typeof(InvalidTestDataClass), nameof(InvalidTestDataClass.TestCases))]
        public bool IsValid_Invalid_Tests(string value) => IpRestrictionPathValidator.IsValid(value);

        public class ValidTestDataClass
        {
            public static IEnumerable TestCases
            {
                get
                {
                    yield return new TestCaseData("/").Returns(true);
                    yield return new TestCaseData("/foo").Returns(true);
                    yield return new TestCaseData("/foo/bar").Returns(true);
                    yield return new TestCaseData("/Foo/Bar").Returns(true);
                    yield return new TestCaseData("  /foo  ").Returns(true);
                }
            }
        }

        public class InvalidTestDataClass
        {
            public static IEnumerable TestCases
            {
                get
                {
                    yield return new TestCaseData(null).Returns(false);
                    yield return new TestCaseData(string.Empty).Returns(false);
                    yield return new TestCaseData("   ").Returns(false);
                    yield return new TestCaseData("foo").Returns(false);
                    yield return new TestCaseData("/foo bar").Returns(false);
                    yield return new TestCaseData("/foo?x=1").Returns(false);
                    yield return new TestCaseData("/foo#frag").Returns(false);
                    yield return new TestCaseData("http://evil.com/foo").Returns(false);
                }
            }
        }
    }
}
