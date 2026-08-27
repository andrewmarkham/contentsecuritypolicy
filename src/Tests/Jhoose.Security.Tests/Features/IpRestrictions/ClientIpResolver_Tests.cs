using System.Net;

using Jhoose.Security.Features.IpRestrictions;

using Microsoft.AspNetCore.Http;

using NUnit.Framework;

namespace Jhoose.Security.Tests.Features.IpRestrictions
{
    [TestFixture]
    public class ClientIpResolver_Tests
    {
        private static HttpRequest RequestFor(string remoteIp, string forwardedFor)
        {
            var context = new DefaultHttpContext();
            if (remoteIp != null)
            {
                context.Connection.RemoteIpAddress = IPAddress.Parse(remoteIp);
            }
            if (forwardedFor != null)
            {
                context.Request.Headers["X-Forwarded-For"] = forwardedFor;
            }
            return context.Request;
        }

        [Test]
        public void NoForwardedHeader_UsesDirectConnection()
        {
            var request = RequestFor("203.0.113.9", null);

            var result = ClientIpResolver.Resolve(request);

            Assert.That(result, Is.EqualTo(IPAddress.Parse("203.0.113.9")));
        }

        [Test]
        public void ForwardedHeaderPresent_UsesFirstEntry()
        {
            // Real client, then two proxy hops the request passed through (e.g. CDN edge, load balancer).
            var request = RequestFor("10.0.0.5", "198.51.100.23, 172.16.0.1, 10.0.0.5");

            var result = ClientIpResolver.Resolve(request);

            Assert.That(result, Is.EqualTo(IPAddress.Parse("198.51.100.23")));
        }

        [Test]
        public void ForwardedHeaderPresent_TrimsWhitespaceAroundEntries()
        {
            var request = RequestFor("10.0.0.5", "  198.51.100.23  ,172.16.0.1");

            var result = ClientIpResolver.Resolve(request);

            Assert.That(result, Is.EqualTo(IPAddress.Parse("198.51.100.23")));
        }

        [Test]
        public void ForwardedHeaderSingleValue_Used()
        {
            var request = RequestFor("10.0.0.5", "198.51.100.23");

            var result = ClientIpResolver.Resolve(request);

            Assert.That(result, Is.EqualTo(IPAddress.Parse("198.51.100.23")));
        }

        [Test]
        public void ForwardedHeaderIpv6_Used()
        {
            var request = RequestFor("10.0.0.5", "2001:db8::1, 10.0.0.5");

            var result = ClientIpResolver.Resolve(request);

            Assert.That(result, Is.EqualTo(IPAddress.Parse("2001:db8::1")));
        }

        [Test]
        public void ForwardedHeaderEmpty_FallsBackToDirectConnection()
        {
            var request = RequestFor("203.0.113.9", "");

            var result = ClientIpResolver.Resolve(request);

            Assert.That(result, Is.EqualTo(IPAddress.Parse("203.0.113.9")));
        }

        [Test]
        public void ForwardedHeaderUnparseable_FallsBackToDirectConnection()
        {
            var request = RequestFor("203.0.113.9", "not-an-ip");

            var result = ClientIpResolver.Resolve(request);

            Assert.That(result, Is.EqualTo(IPAddress.Parse("203.0.113.9")));
        }
    }
}
