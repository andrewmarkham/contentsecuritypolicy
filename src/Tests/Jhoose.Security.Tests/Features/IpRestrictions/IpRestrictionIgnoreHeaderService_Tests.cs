using System;
using System.Collections.Generic;

using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.IpRestrictions.Models;
using Jhoose.Security.Features.IpRestrictions.Services;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;

using NSubstitute;

using NUnit.Framework;

namespace Jhoose.Security.Tests.Features.IpRestrictions
{
    [TestFixture]
    public class IpRestrictionIgnoreHeaderService_Tests
    {
        private ISecurityRepository<IpRestrictionIgnoreHeader> ignoreHeaderRepository;
        private IpRestrictionIgnoreHeaderService service;

        [SetUp]
        public void SetUp()
        {
            ignoreHeaderRepository = Substitute.For<ISecurityRepository<IpRestrictionIgnoreHeader>>();
            service = new IpRestrictionIgnoreHeaderService(ignoreHeaderRepository);
        }

        private static HttpRequest RequestWithHeader(string name = null, StringValues value = default)
        {
            var context = new DefaultHttpContext();
            if (name != null)
            {
                context.Request.Headers[name] = value;
            }
            return context.Request;
        }

        [Test]
        public void NoEntries_NotIgnored()
        {
            ignoreHeaderRepository.Load().Returns(new List<IpRestrictionIgnoreHeader>());

            var result = service.IsIgnored("site1", RequestWithHeader("X-Bypass", "secret"));

            Assert.That(result, Is.False);
        }

        [Test]
        public void GlobalEntryMatches_Ignored()
        {
            ignoreHeaderRepository.Load().Returns(new List<IpRestrictionIgnoreHeader>
            {
                new(Guid.NewGuid(), "X-Bypass", "secret", "*"),
            });

            var result = service.IsIgnored("site1", RequestWithHeader("X-Bypass", "secret"));

            Assert.That(result, Is.True);
        }

        [Test]
        public void HeaderPresentButValueDoesNotMatch_NotIgnored()
        {
            ignoreHeaderRepository.Load().Returns(new List<IpRestrictionIgnoreHeader>
            {
                new(Guid.NewGuid(), "X-Bypass", "secret", "*"),
            });

            var result = service.IsIgnored("site1", RequestWithHeader("X-Bypass", "wrong"));

            Assert.That(result, Is.False);
        }

        [Test]
        public void HeaderMissing_NotIgnored()
        {
            ignoreHeaderRepository.Load().Returns(new List<IpRestrictionIgnoreHeader>
            {
                new(Guid.NewGuid(), "X-Bypass", "secret", "*"),
            });

            var result = service.IsIgnored("site1", RequestWithHeader());

            Assert.That(result, Is.False);
        }

        [Test]
        public void SiteSpecificEntry_IgnoredOnlyForThatSite()
        {
            ignoreHeaderRepository.Load().Returns(new List<IpRestrictionIgnoreHeader>
            {
                new(Guid.NewGuid(), "X-Bypass", "secret", "site1"),
            });

            Assert.That(service.IsIgnored("site1", RequestWithHeader("X-Bypass", "secret")), Is.True);
            Assert.That(service.IsIgnored("site2", RequestWithHeader("X-Bypass", "secret")), Is.False);
        }

        [Test]
        public void UnionOfGlobalAndSiteEntries_BothApply()
        {
            ignoreHeaderRepository.Load().Returns(new List<IpRestrictionIgnoreHeader>
            {
                new(Guid.NewGuid(), "X-Global", "secret", "*"),
                new(Guid.NewGuid(), "X-Site", "secret", "site1"),
            });

            Assert.That(service.IsIgnored("site1", RequestWithHeader("X-Global", "secret")), Is.True);
            Assert.That(service.IsIgnored("site1", RequestWithHeader("X-Site", "secret")), Is.True);
            Assert.That(service.IsIgnored("site2", RequestWithHeader("X-Global", "secret")), Is.True);
            Assert.That(service.IsIgnored("site2", RequestWithHeader("X-Site", "secret")), Is.False);
        }

        [Test]
        public void CaseInsensitiveNameAndValueMatch()
        {
            ignoreHeaderRepository.Load().Returns(new List<IpRestrictionIgnoreHeader>
            {
                new(Guid.NewGuid(), "X-Bypass", "Secret", "*"),
            });

            var result = service.IsIgnored("site1", RequestWithHeader("x-bypass", "SECRET"));

            Assert.That(result, Is.True);
        }

        [Test]
        public void MultiValueHeader_MatchesIfAnyValueMatches()
        {
            ignoreHeaderRepository.Load().Returns(new List<IpRestrictionIgnoreHeader>
            {
                new(Guid.NewGuid(), "X-Bypass", "secret", "*"),
            });

            var result = service.IsIgnored("site1", RequestWithHeader("X-Bypass", new StringValues(["other", "secret"])));

            Assert.That(result, Is.True);
        }
    }
}
