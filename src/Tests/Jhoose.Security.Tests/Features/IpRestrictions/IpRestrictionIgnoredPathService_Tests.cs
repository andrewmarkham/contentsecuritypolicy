using System;
using System.Collections.Generic;

using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.IpRestrictions.Models;
using Jhoose.Security.Features.IpRestrictions.Services;

using Microsoft.AspNetCore.Http;

using NSubstitute;

using NUnit.Framework;

namespace Jhoose.Security.Tests.Features.IpRestrictions
{
    [TestFixture]
    public class IpRestrictionIgnoredPathService_Tests
    {
        private ISecurityRepository<IpRestrictionIgnoredPath> ignoredPathRepository;
        private IpRestrictionIgnoredPathService service;

        [SetUp]
        public void SetUp()
        {
            ignoredPathRepository = Substitute.For<ISecurityRepository<IpRestrictionIgnoredPath>>();
            service = new IpRestrictionIgnoredPathService(ignoredPathRepository);
        }

        private static HttpRequest RequestFor(string path)
        {
            var context = new DefaultHttpContext();
            context.Request.Path = path;
            return context.Request;
        }

        [Test]
        public void NoEntries_NotIgnored()
        {
            ignoredPathRepository.Load().Returns(new List<IpRestrictionIgnoredPath>());

            var result = service.IsIgnored("site1", RequestFor("/anything"));

            Assert.That(result, Is.False);
        }

        [Test]
        public void GlobalEntryMatchesSubPath_Ignored()
        {
            ignoredPathRepository.Load().Returns(new List<IpRestrictionIgnoredPath>
            {
                new(Guid.NewGuid(), "/health", "*"),
            });

            var result = service.IsIgnored("site1", RequestFor("/health/live"));

            Assert.That(result, Is.True);
        }

        [Test]
        public void GlobalEntryDoesNotMatch_NotIgnored()
        {
            ignoredPathRepository.Load().Returns(new List<IpRestrictionIgnoredPath>
            {
                new(Guid.NewGuid(), "/health", "*"),
            });

            var result = service.IsIgnored("site1", RequestFor("/other"));

            Assert.That(result, Is.False);
        }

        [Test]
        public void StringPrefixButNotSegmentPrefix_NotIgnored()
        {
            ignoredPathRepository.Load().Returns(new List<IpRestrictionIgnoredPath>
            {
                new(Guid.NewGuid(), "/admin", "*"),
            });

            var result = service.IsIgnored("site1", RequestFor("/administration"));

            Assert.That(result, Is.False);
        }

        [Test]
        public void SiteSpecificEntry_IgnoredOnlyForThatSite()
        {
            ignoredPathRepository.Load().Returns(new List<IpRestrictionIgnoredPath>
            {
                new(Guid.NewGuid(), "/health", "site1"),
            });

            Assert.That(service.IsIgnored("site1", RequestFor("/health")), Is.True);
            Assert.That(service.IsIgnored("site2", RequestFor("/health")), Is.False);
        }

        [Test]
        public void UnionOfGlobalAndSiteEntries_BothApply()
        {
            ignoredPathRepository.Load().Returns(new List<IpRestrictionIgnoredPath>
            {
                new(Guid.NewGuid(), "/health", "*"),
                new(Guid.NewGuid(), "/webhooks", "site1"),
            });

            Assert.That(service.IsIgnored("site1", RequestFor("/health")), Is.True);
            Assert.That(service.IsIgnored("site1", RequestFor("/webhooks")), Is.True);
            Assert.That(service.IsIgnored("site2", RequestFor("/health")), Is.True);
            Assert.That(service.IsIgnored("site2", RequestFor("/webhooks")), Is.False);
        }

        [Test]
        public void CaseInsensitiveMatch()
        {
            ignoredPathRepository.Load().Returns(new List<IpRestrictionIgnoredPath>
            {
                new(Guid.NewGuid(), "/Health", "*"),
            });

            var result = service.IsIgnored("site1", RequestFor("/health/live"));

            Assert.That(result, Is.True);
        }

        [Test]
        public void RootPathEntry_OnlyMatchesRootExactly()
        {
            // StartsWithSegments("/") only matches the literal "/" request path, not everything
            // under it — it is not a wildcard, since the character-after-prefix check has no
            // "next segment" to find beyond the root. Pinned down here since it's easy to assume
            // (incorrectly) that "/" acts as a catch-all.
            ignoredPathRepository.Load().Returns(new List<IpRestrictionIgnoredPath>
            {
                new(Guid.NewGuid(), "/", "*"),
            });

            Assert.That(service.IsIgnored("site1", RequestFor("/")), Is.True);
            Assert.That(service.IsIgnored("site1", RequestFor("/anything/at/all")), Is.False);
        }

        [Test]
        public void TrailingSlashOnEntry_DoesNotMatchSubPaths()
        {
            // A trailing slash on the stored entry makes it match only that exact path, not
            // sub-paths — StartsWithSegments("/health/") requires the request path to be either
            // exactly "/health/" or to have a '/' immediately after the entry's own trailing '/',
            // which "/health/live" does not satisfy. Store entries without a trailing slash to
            // get prefix matching over sub-paths.
            ignoredPathRepository.Load().Returns(new List<IpRestrictionIgnoredPath>
            {
                new(Guid.NewGuid(), "/health/", "*"),
            });

            Assert.That(service.IsIgnored("site1", RequestFor("/health")), Is.False);
            Assert.That(service.IsIgnored("site1", RequestFor("/health/")), Is.True);
            Assert.That(service.IsIgnored("site1", RequestFor("/health/live")), Is.False);
        }
    }
}
