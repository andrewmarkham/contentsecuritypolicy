using System.Net;
using System.Threading.Tasks;

using Jhoose.Security.Configuration;
using Jhoose.Security.Features.Core.Services;
using Jhoose.Security.Features.IpRestrictions.Services;
using Jhoose.Security.Middleware;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

using NSubstitute;

using NUnit.Framework;

namespace Jhoose.Security.Tests.Middleware
{
    [TestFixture]
    public class IpRestrictionMiddleware_InvokeAsync_Tests
    {
        private IIpRestrictionService ipRestrictionService;
        private IIpRestrictionIgnoredPathService ignoredPathService;
        private IIpRestrictionIgnoreHeaderService ignoreHeaderService;
        private ISiteService siteService;
        private bool nextCalled;

        [SetUp]
        public void SetUp()
        {
            ipRestrictionService = Substitute.For<IIpRestrictionService>();
            ignoredPathService = Substitute.For<IIpRestrictionIgnoredPathService>();
            ignoreHeaderService = Substitute.For<IIpRestrictionIgnoreHeaderService>();
            siteService = Substitute.For<ISiteService>();
            siteService.ResolveSiteId(Arg.Any<string>()).Returns("site1");
            nextCalled = false;
        }

        private IpRestrictionMiddleware CreateMiddleware() => new(_ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        private static DefaultHttpContext ContextFor(string path)
        {
            var context = new DefaultHttpContext();
            context.Request.Path = path;
            context.Connection.RemoteIpAddress = IPAddress.Parse("198.51.100.1");
            return context;
        }

        private static IOptions<JhooseSecurityOptions> OptionsWithScope(IpRestrictionScope scope) =>
            Options.Create(new JhooseSecurityOptions { IpRestrictionScope = scope });

        [Test]
        public async Task IgnoredPath_ShortCircuitsBeforeIpCheck()
        {
            ignoredPathService.IsIgnored(Arg.Any<string>(), Arg.Any<HttpRequest>()).Returns(true);
            ipRestrictionService.IsAllowed(Arg.Any<string>(), Arg.Any<IPAddress>()).Returns(false);

            var context = ContextFor("/webhooks/stripe");
            var middleware = CreateMiddleware();

            await middleware.InvokeAsync(context, ipRestrictionService, ignoredPathService, ignoreHeaderService, siteService, OptionsWithScope(IpRestrictionScope.Both));

            ipRestrictionService.DidNotReceive().IsAllowed(Arg.Any<string>(), Arg.Any<IPAddress>());
            Assert.That(nextCalled, Is.True);
            Assert.That(context.Response.StatusCode, Is.EqualTo(200));
        }

        [Test]
        public async Task NotIgnoredPath_DisallowedIp_Returns403()
        {
            ignoredPathService.IsIgnored(Arg.Any<string>(), Arg.Any<HttpRequest>()).Returns(false);
            ignoreHeaderService.IsIgnored(Arg.Any<string>(), Arg.Any<HttpRequest>()).Returns(false);
            ipRestrictionService.IsAllowed(Arg.Any<string>(), Arg.Any<IPAddress>()).Returns(false);

            var context = ContextFor("/articles");
            var middleware = CreateMiddleware();

            await middleware.InvokeAsync(context, ipRestrictionService, ignoredPathService, ignoreHeaderService, siteService, OptionsWithScope(IpRestrictionScope.Both));

            Assert.That(nextCalled, Is.False);
            Assert.That(context.Response.StatusCode, Is.EqualTo(StatusCodes.Status403Forbidden));
        }

        [Test]
        public async Task OutOfScopeRequest_IgnoredPathServiceNeverCalled()
        {
            var context = ContextFor("/articles");
            var middleware = CreateMiddleware();

            await middleware.InvokeAsync(context, ipRestrictionService, ignoredPathService, ignoreHeaderService, siteService, OptionsWithScope(IpRestrictionScope.Off));

            ignoredPathService.DidNotReceive().IsIgnored(Arg.Any<string>(), Arg.Any<HttpRequest>());
            ignoreHeaderService.DidNotReceive().IsIgnored(Arg.Any<string>(), Arg.Any<HttpRequest>());
            Assert.That(nextCalled, Is.True);
        }

        [Test]
        public async Task IgnoredHeader_ShortCircuitsBeforeIpCheck()
        {
            ignoredPathService.IsIgnored(Arg.Any<string>(), Arg.Any<HttpRequest>()).Returns(false);
            ignoreHeaderService.IsIgnored(Arg.Any<string>(), Arg.Any<HttpRequest>()).Returns(true);
            ipRestrictionService.IsAllowed(Arg.Any<string>(), Arg.Any<IPAddress>()).Returns(false);

            var context = ContextFor("/articles");
            var middleware = CreateMiddleware();

            await middleware.InvokeAsync(context, ipRestrictionService, ignoredPathService, ignoreHeaderService, siteService, OptionsWithScope(IpRestrictionScope.Both));

            ipRestrictionService.DidNotReceive().IsAllowed(Arg.Any<string>(), Arg.Any<IPAddress>());
            Assert.That(nextCalled, Is.True);
            Assert.That(context.Response.StatusCode, Is.EqualTo(200));
        }
    }
}
