using System.Collections;
using System.Net;

using Jhoose.Security.Features.IpRestrictions;

using NUnit.Framework;

namespace Jhoose.Security.Tests.Features.IpRestrictions
{
    [TestFixture]
    public class IpNetworkParser_Tests
    {
        [TestCaseSource(typeof(ValidTestDataClass), nameof(ValidTestDataClass.TestCases))]
        public bool TryParse_Valid_Tests(string value)
        {
            return IpNetworkParser.TryParse(value, out _);
        }

        [TestCaseSource(typeof(InvalidTestDataClass), nameof(InvalidTestDataClass.TestCases))]
        public bool TryParse_Invalid_Tests(string value)
        {
            return IpNetworkParser.TryParse(value, out _);
        }

        [Test]
        public void SingleIPv4Address_TreatedAsSlash32()
        {
            IpNetworkParser.TryParse("203.0.113.5", out var network);

            Assert.That(network.Contains(IPAddress.Parse("203.0.113.5")), Is.True);
            Assert.That(network.Contains(IPAddress.Parse("203.0.113.6")), Is.False);
        }

        [Test]
        public void SingleIPv6Address_TreatedAsSlash128()
        {
            IpNetworkParser.TryParse("2001:db8::1", out var network);

            Assert.That(network.Contains(IPAddress.Parse("2001:db8::1")), Is.True);
            Assert.That(network.Contains(IPAddress.Parse("2001:db8::2")), Is.False);
        }

        [Test]
        public void Ipv4Cidr_ContainsAddressesInRange()
        {
            IpNetworkParser.TryParse("203.0.113.0/24", out var network);

            Assert.That(network.Contains(IPAddress.Parse("203.0.113.42")), Is.True);
            Assert.That(network.Contains(IPAddress.Parse("203.0.114.1")), Is.False);
        }

        [Test]
        public void Ipv6Cidr_ContainsAddressesInRange()
        {
            IpNetworkParser.TryParse("2001:db8::/32", out var network);

            Assert.That(network.Contains(IPAddress.Parse("2001:db8:1234::1")), Is.True);
            Assert.That(network.Contains(IPAddress.Parse("2001:db9::1")), Is.False);
        }

        public class ValidTestDataClass
        {
            public static IEnumerable TestCases
            {
                get
                {
                    yield return new TestCaseData("203.0.113.5").Returns(true);
                    yield return new TestCaseData("203.0.113.0/24").Returns(true);
                    yield return new TestCaseData("203.0.113.0/32").Returns(true);
                    yield return new TestCaseData("0.0.0.0/0").Returns(true);
                    yield return new TestCaseData("2001:db8::1").Returns(true);
                    yield return new TestCaseData("2001:db8::/32").Returns(true);
                    yield return new TestCaseData("2001:db8::/128").Returns(true);
                    yield return new TestCaseData("::/0").Returns(true);
                    yield return new TestCaseData("  203.0.113.5  ").Returns(true);
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
                    yield return new TestCaseData("not-an-ip").Returns(false);
                    yield return new TestCaseData("203.0.113.5/33").Returns(false);
                    yield return new TestCaseData("2001:db8::1/129").Returns(false);
                    yield return new TestCaseData("999.999.999.999").Returns(false);
                    yield return new TestCaseData("203.0.113.5/").Returns(false);
                }
            }
        }
    }
}
