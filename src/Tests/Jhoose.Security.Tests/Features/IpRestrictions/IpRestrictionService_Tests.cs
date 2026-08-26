using System;
using System.Collections.Generic;
using System.Net;

using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.IpRestrictions.Models;
using Jhoose.Security.Features.IpRestrictions.Services;
using Jhoose.Security.Features.Settings.Models;
using Jhoose.Security.Features.Settings.Repository;

using NSubstitute;

using NUnit.Framework;

namespace Jhoose.Security.Tests.Features.IpRestrictions
{
    [TestFixture]
    public class IpRestrictionService_Tests
    {
        private ISecurityRepository<IpRestrictionEntry> entryRepository;
        private ISettingsRepository settingsRepository;
        private IpRestrictionService service;

        [SetUp]
        public void SetUp()
        {
            entryRepository = Substitute.For<ISecurityRepository<IpRestrictionEntry>>();
            settingsRepository = Substitute.For<ISettingsRepository>();
            service = new IpRestrictionService(entryRepository, settingsRepository);
        }

        private void SetMode(string mode, Dictionary<string, string> siteModes = null)
        {
            var settings = new CspSettings { IpRestrictionMode = mode };
            if (siteModes != null)
            {
                settings.IpRestrictionModesBySite = siteModes;
            }
            settingsRepository.Load().Returns(settings);
        }

        [Test]
        public void Disabled_AllowsAnyAddress()
        {
            SetMode("off");
            entryRepository.Load().Returns(new List<IpRestrictionEntry>());

            var result = service.IsAllowed("site1", IPAddress.Parse("198.51.100.1"));

            Assert.That(result, Is.True);
        }

        [Test]
        public void Enabled_NoEntries_BlocksEverything()
        {
            SetMode("on");
            entryRepository.Load().Returns(new List<IpRestrictionEntry>());

            var result = service.IsAllowed("site1", IPAddress.Parse("198.51.100.1"));

            Assert.That(result, Is.False);
        }

        [Test]
        public void Enabled_GlobalEntryMatches_Allowed()
        {
            SetMode("on");
            entryRepository.Load().Returns(new List<IpRestrictionEntry>
            {
                new(Guid.NewGuid(), "198.51.100.1", "*"),
            });

            var result = service.IsAllowed("site1", IPAddress.Parse("198.51.100.1"));

            Assert.That(result, Is.True);
        }

        [Test]
        public void Enabled_GlobalEntryDoesNotMatch_Blocked()
        {
            SetMode("on");
            entryRepository.Load().Returns(new List<IpRestrictionEntry>
            {
                new(Guid.NewGuid(), "198.51.100.1", "*"),
            });

            var result = service.IsAllowed("site1", IPAddress.Parse("198.51.100.2"));

            Assert.That(result, Is.False);
        }

        [Test]
        public void Enabled_SiteSpecificEntry_AllowedOnlyForThatSite()
        {
            SetMode("on");
            entryRepository.Load().Returns(new List<IpRestrictionEntry>
            {
                new(Guid.NewGuid(), "203.0.113.0/24", "site1"),
            });

            Assert.That(service.IsAllowed("site1", IPAddress.Parse("203.0.113.42")), Is.True);
            Assert.That(service.IsAllowed("site2", IPAddress.Parse("203.0.113.42")), Is.False);
        }

        [Test]
        public void Enabled_UnionOfGlobalAndSiteEntries_BothApply()
        {
            SetMode("on");
            entryRepository.Load().Returns(new List<IpRestrictionEntry>
            {
                new(Guid.NewGuid(), "198.51.100.1", "*"),
                new(Guid.NewGuid(), "203.0.113.5", "site1"),
            });

            Assert.That(service.IsAllowed("site1", IPAddress.Parse("198.51.100.1")), Is.True);
            Assert.That(service.IsAllowed("site1", IPAddress.Parse("203.0.113.5")), Is.True);
            Assert.That(service.IsAllowed("site2", IPAddress.Parse("198.51.100.1")), Is.True);
            Assert.That(service.IsAllowed("site2", IPAddress.Parse("203.0.113.5")), Is.False);
        }

        [Test]
        public void Enabled_Ipv6ClientAgainstIpv6CidrEntry_Allowed()
        {
            SetMode("on");
            entryRepository.Load().Returns(new List<IpRestrictionEntry>
            {
                new(Guid.NewGuid(), "2001:db8::/32", "*"),
            });

            var result = service.IsAllowed("site1", IPAddress.Parse("2001:db8:abcd::1"));

            Assert.That(result, Is.True);
        }

        [Test]
        public void SiteModeOverridesGlobalMode()
        {
            SetMode("on", new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["site1"] = "off",
            });
            entryRepository.Load().Returns(new List<IpRestrictionEntry>());

            Assert.That(service.IsAllowed("site1", IPAddress.Parse("198.51.100.1")), Is.True);
            Assert.That(service.IsAllowed("site2", IPAddress.Parse("198.51.100.1")), Is.False);
        }
    }
}
