using Jhoose.Security.Features.IpRestrictions;

using NUnit.Framework;

namespace Jhoose.Security.Tests.Features.IpRestrictions
{
    [TestFixture]
    public class IpRestrictionHeaderValidator_Tests
    {
        [TestCase("X-Internal-Bypass", "secret123", ExpectedResult = true)]
        [TestCase("X-Api-Key", "abc.def-123_456~789", ExpectedResult = true)]
        [TestCase("Authorization", "Bearer some-token", ExpectedResult = true)]
        public bool IsValid_ValidPairs(string headerName, string headerValue) =>
            IpRestrictionHeaderValidator.IsValid(headerName, headerValue);

        [TestCase(null, "value", ExpectedResult = false)]
        [TestCase("", "value", ExpectedResult = false)]
        [TestCase("   ", "value", ExpectedResult = false)]
        [TestCase("X-Has Space", "value", ExpectedResult = false)]
        [TestCase("X-Has:Colon", "value", ExpectedResult = false)]
        [TestCase("X-Valid", null, ExpectedResult = false)]
        [TestCase("X-Valid", "", ExpectedResult = false)]
        [TestCase("X-Valid", "   ", ExpectedResult = false)]
        [TestCase("X-Valid", "line1\r\nline2", ExpectedResult = false)]
        [TestCase("X-Valid", "line1\nline2", ExpectedResult = false)]
        public bool IsValid_InvalidPairs(string headerName, string headerValue) =>
            IpRestrictionHeaderValidator.IsValid(headerName, headerValue);
    }
}
