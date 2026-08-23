using System;
using System.Collections.Generic;

using Jhoose.Security.Features.Core;
using Jhoose.Security.Features.CSP.Models;
using Jhoose.Security.Features.ImportExport.Models;
using Jhoose.Security.Features.ImportExport.Services;
using Jhoose.Security.Features.IpRestrictions.Models;
using Jhoose.Security.Features.Permissions.Models;
using Jhoose.Security.Features.ResponseHeaders.Models;
using Jhoose.Security.Features.Settings.Models;
using Jhoose.Security.Features.Settings.Repository;

using Microsoft.Extensions.Logging;

using NSubstitute;

using NUnit.Framework;

namespace Jhoose.Security.Tests.Features.ImportExport
{
    [TestFixture]
    public class ImportExportService_Tests
    {
        private ISecurityRepository<CspPolicy> policyRepository;
        private ISecurityRepository<ResponseHeader> responseHeadersRepository;
        private ISecurityRepository<PermissionPolicy> permissionsRepository;
        private ISecurityRepository<IpRestrictionEntry> ipRestrictionRepository;
        private ISecurityRepository<IpRestrictionIgnoredPath> ipRestrictionIgnoredPathRepository;
        private ISecurityRepository<IpRestrictionIgnoreHeader> ipRestrictionIgnoreHeaderRepository;
        private ISettingsRepository settingsRepository;
        private ILogger<ImportExportService> logger;
        private ImportExportService service;

        [SetUp]
        public void SetUp()
        {
            policyRepository = Substitute.For<ISecurityRepository<CspPolicy>>();
            responseHeadersRepository = Substitute.For<ISecurityRepository<ResponseHeader>>();
            permissionsRepository = Substitute.For<ISecurityRepository<PermissionPolicy>>();
            ipRestrictionRepository = Substitute.For<ISecurityRepository<IpRestrictionEntry>>();
            ipRestrictionIgnoredPathRepository = Substitute.For<ISecurityRepository<IpRestrictionIgnoredPath>>();
            ipRestrictionIgnoreHeaderRepository = Substitute.For<ISecurityRepository<IpRestrictionIgnoreHeader>>();
            settingsRepository = Substitute.For<ISettingsRepository>();
            logger = Substitute.For<ILogger<ImportExportService>>();

            service = new ImportExportService(policyRepository, responseHeadersRepository, permissionsRepository,
                ipRestrictionRepository, ipRestrictionIgnoredPathRepository, ipRestrictionIgnoreHeaderRepository,
                settingsRepository, logger);
        }

        [Test]
        public void Export_IncludeIpRestrictions_True_PopulatesAllThreeLists()
        {
            var entry = new IpRestrictionEntry(Guid.NewGuid(), "198.51.100.1", "*");
            var ignoredPath = new IpRestrictionIgnoredPath(Guid.NewGuid(), "/healthz", "*");
            var ignoreHeader = new IpRestrictionIgnoreHeader(Guid.NewGuid(), "X-Bypass", "secret", "*");

            ipRestrictionRepository.Load().Returns(new List<IpRestrictionEntry> { entry });
            ipRestrictionIgnoredPathRepository.Load().Returns(new List<IpRestrictionIgnoredPath> { ignoredPath });
            ipRestrictionIgnoreHeaderRepository.Load().Returns(new List<IpRestrictionIgnoreHeader> { ignoreHeader });

            var export = service.Export(includeCsp: false, includePermissions: false, includeHeaders: false, includeSettings: false, includeIpRestrictions: true);

            Assert.That(export.IpRestrictions, Is.EquivalentTo(new[] { entry }));
            Assert.That(export.IpRestrictionIgnoredPaths, Is.EquivalentTo(new[] { ignoredPath }));
            Assert.That(export.IpRestrictionIgnoreHeaders, Is.EquivalentTo(new[] { ignoreHeader }));
            Assert.That(export.CspPolicies, Is.Null);
            Assert.That(export.Permissions, Is.Null);
            Assert.That(export.ResponseHeaders, Is.Null);
            Assert.That(export.CspSettings, Is.Null);
        }

        [Test]
        public void Export_IncludeIpRestrictions_False_LeavesAllThreeListsNull()
        {
            policyRepository.Load().Returns(new List<CspPolicy>());
            permissionsRepository.Load().Returns(new List<PermissionPolicy>());
            responseHeadersRepository.Load().Returns(new List<ResponseHeader>());
            settingsRepository.Load().Returns(new CspSettings());

            var export = service.Export(includeIpRestrictions: false);

            Assert.That(export.IpRestrictions, Is.Null);
            Assert.That(export.IpRestrictionIgnoredPaths, Is.Null);
            Assert.That(export.IpRestrictionIgnoreHeaders, Is.Null);

            ipRestrictionRepository.DidNotReceive().Load();
            ipRestrictionIgnoredPathRepository.DidNotReceive().Load();
            ipRestrictionIgnoreHeaderRepository.DidNotReceive().Load();
        }

        [Test]
        public void Export_DefaultParameters_IncludesIpRestrictions()
        {
            policyRepository.Load().Returns(new List<CspPolicy>());
            permissionsRepository.Load().Returns(new List<PermissionPolicy>());
            responseHeadersRepository.Load().Returns(new List<ResponseHeader>());
            settingsRepository.Load().Returns(new CspSettings());
            ipRestrictionRepository.Load().Returns(new List<IpRestrictionEntry>());
            ipRestrictionIgnoredPathRepository.Load().Returns(new List<IpRestrictionIgnoredPath>());
            ipRestrictionIgnoreHeaderRepository.Load().Returns(new List<IpRestrictionIgnoreHeader>());

            var export = service.Export();

            Assert.That(export.CspPolicies, Is.Not.Null);
            Assert.That(export.Permissions, Is.Not.Null);
            Assert.That(export.ResponseHeaders, Is.Not.Null);
            Assert.That(export.CspSettings, Is.Not.Null);
            Assert.That(export.IpRestrictions, Is.Not.Null);
            Assert.That(export.IpRestrictionIgnoredPaths, Is.Not.Null);
            Assert.That(export.IpRestrictionIgnoreHeaders, Is.Not.Null);
        }

        [Test]
        public void Import_IpRestrictionsPresent_ClearsAndSavesEachEntry()
        {
            var entryOne = new IpRestrictionEntry(Guid.NewGuid(), "198.51.100.1", "*");
            var entryTwo = new IpRestrictionEntry(Guid.NewGuid(), "203.0.113.0/24", "site1");
            var export = new JhoooseSecurityExport
            {
                IpRestrictions = new List<IpRestrictionEntry> { entryOne, entryTwo },
            };

            service.Import(export);

            ipRestrictionRepository.Received(1).Clear();
            ipRestrictionRepository.Received(1).Save(entryOne);
            ipRestrictionRepository.Received(1).Save(entryTwo);
        }

        [Test]
        public void Import_IpRestrictionIgnoredPathsPresent_ClearsAndSavesEachEntry()
        {
            var entryOne = new IpRestrictionIgnoredPath(Guid.NewGuid(), "/healthz", "*");
            var entryTwo = new IpRestrictionIgnoredPath(Guid.NewGuid(), "/webhooks", "site1");
            var export = new JhoooseSecurityExport
            {
                IpRestrictionIgnoredPaths = new List<IpRestrictionIgnoredPath> { entryOne, entryTwo },
            };

            service.Import(export);

            ipRestrictionIgnoredPathRepository.Received(1).Clear();
            ipRestrictionIgnoredPathRepository.Received(1).Save(entryOne);
            ipRestrictionIgnoredPathRepository.Received(1).Save(entryTwo);
        }

        [Test]
        public void Import_IpRestrictionIgnoreHeadersPresent_ClearsAndSavesEachEntry()
        {
            var entryOne = new IpRestrictionIgnoreHeader(Guid.NewGuid(), "X-Bypass", "secret", "*");
            var entryTwo = new IpRestrictionIgnoreHeader(Guid.NewGuid(), "X-Other", "value", "site1");
            var export = new JhoooseSecurityExport
            {
                IpRestrictionIgnoreHeaders = new List<IpRestrictionIgnoreHeader> { entryOne, entryTwo },
            };

            service.Import(export);

            ipRestrictionIgnoreHeaderRepository.Received(1).Clear();
            ipRestrictionIgnoreHeaderRepository.Received(1).Save(entryOne);
            ipRestrictionIgnoreHeaderRepository.Received(1).Save(entryTwo);
        }

        [Test]
        public void Import_IpRestrictionsNullOrEmpty_DoesNotTouchRepository()
        {
            service.Import(new JhoooseSecurityExport { IpRestrictions = null });
            service.Import(new JhoooseSecurityExport { IpRestrictions = new List<IpRestrictionEntry>() });

            ipRestrictionRepository.DidNotReceive().Clear();
            ipRestrictionRepository.DidNotReceive().Save(Arg.Any<IpRestrictionEntry>());
        }

        [Test]
        public void Import_IpRestrictionIgnoredPathsNullOrEmpty_DoesNotTouchRepository()
        {
            service.Import(new JhoooseSecurityExport { IpRestrictionIgnoredPaths = null });
            service.Import(new JhoooseSecurityExport { IpRestrictionIgnoredPaths = new List<IpRestrictionIgnoredPath>() });

            ipRestrictionIgnoredPathRepository.DidNotReceive().Clear();
            ipRestrictionIgnoredPathRepository.DidNotReceive().Save(Arg.Any<IpRestrictionIgnoredPath>());
        }

        [Test]
        public void Import_IpRestrictionIgnoreHeadersNullOrEmpty_DoesNotTouchRepository()
        {
            service.Import(new JhoooseSecurityExport { IpRestrictionIgnoreHeaders = null });
            service.Import(new JhoooseSecurityExport { IpRestrictionIgnoreHeaders = new List<IpRestrictionIgnoreHeader>() });

            ipRestrictionIgnoreHeaderRepository.DidNotReceive().Clear();
            ipRestrictionIgnoreHeaderRepository.DidNotReceive().Save(Arg.Any<IpRestrictionIgnoreHeader>());
        }

        [Test]
        public void IsValid_HashRoundTrips_WithIpRestrictionDataPresent()
        {
            policyRepository.Load().Returns(new List<CspPolicy>());
            permissionsRepository.Load().Returns(new List<PermissionPolicy>());
            responseHeadersRepository.Load().Returns(new List<ResponseHeader>());
            settingsRepository.Load().Returns(new CspSettings());
            ipRestrictionRepository.Load().Returns(new List<IpRestrictionEntry>
            {
                new(Guid.NewGuid(), "198.51.100.1", "*"),
            });
            ipRestrictionIgnoredPathRepository.Load().Returns(new List<IpRestrictionIgnoredPath>
            {
                new(Guid.NewGuid(), "/healthz", "*"),
            });
            ipRestrictionIgnoreHeaderRepository.Load().Returns(new List<IpRestrictionIgnoreHeader>
            {
                new(Guid.NewGuid(), "X-Bypass", "secret", "*"),
            });

            var export = service.Export();

            Assert.That(service.IsValid(export), Is.True);
        }
    }
}
