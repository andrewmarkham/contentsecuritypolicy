#if NET5_0_OR_GREATER

using System.Collections;
using System.Collections.Generic;
using Jhoose.Security.DependencyInjection;
using Jhoose.Security.Services;
using Microsoft.AspNetCore.Http;
using NUnit.Framework;
using NSubstitute;
using Jhoose.Security.Core.Provider;
using Jhoose.Security.Core.Cache;

using Microsoft.Extensions.Logging;
using Jhoose.Security.Core.Models;
using Jhoose.Security.Core;
using System;
using System.Collections.Specialized;
using System.Net.Http;
using System.IO;
using System.Threading.Tasks;
using EPiServer;
using Jhoose.Security.Core.Models.CSP;
using Jhoose.Security.Core.Models.SecurityHeaders;

namespace Jhoose.Security.Tests.Services
{
    [TestFixture]
    public class JhooseSecurityService_Tests
    {
        ICacheManager cacheManager = Substitute.For<ICacheManager>();

        [SetUp]
        public void SetupTests()
        {
            // configure settings
            cacheManager.Get<CspSettings>(Constants.SettingsCacheKey, Arg.Any<Func<CspSettings>>(), Arg.Any<TimeSpan>()).Returns(new CspSettings
            {
                Mode = "on"
            });
        }

        [Test]
        public void ContentSecurityPolicy_Added_Test()
        {
            //Arrange
            var cspProvider = Substitute.For<ICspProvider>();
            var responseHeadersProvider = Substitute.For<IResponseHeadersProvider>();

            // configure csp policy header
            cacheManager.Get<IEnumerable<CspPolicyHeaderBase>>(Constants.PolicyCacheKey, Arg.Any<Func<IEnumerable<CspPolicyHeaderBase>>>(), Arg.Any<TimeSpan>())
                        .Returns(new
                            List<CspPolicyHeaderBase>()
                            {
                                new CspPolicyHeader(new CspSettings())
                                    {
                                        Policies = new List<CspPolicy>()
                                    }
                            });

            var logger = Substitute.For<ILogger<JhooseSecurityService>>();

            var service = new JhooseSecurityService(cspProvider, responseHeadersProvider, cacheManager, logger);

            var response = new HttpResponseStub();

            //Act
            service.AddContentSecurityPolicy(response);

            //Assert
            Assert.IsTrue(response.Headers.ContainsKey("Content-Security-Policy"));
            Assert.AreEqual(response.Headers.Count, 1);
        }

        [Test]
        public void ContentSecurityPolicy_HandleDuplicated_Test()
        {
            //Arrange
            var cspProvider = Substitute.For<ICspProvider>();
            var responseHeadersProvider = Substitute.For<IResponseHeadersProvider>();

            // configure csp policy header
            cacheManager.Get<IEnumerable<CspPolicyHeader>>(Constants.PolicyCacheKey, Arg.Any<Func<IEnumerable<CspPolicyHeader>>>(), Arg.Any<TimeSpan>())
                        .Returns(new
                            List<CspPolicyHeader>()
                            {
                                new CspPolicyHeader(new CspSettings())
                                    {
                                        Policies = new List<CspPolicy>()
                                    }
                            });

            var logger = Substitute.For<ILogger<JhooseSecurityService>>();

            var service = new JhooseSecurityService(cspProvider, responseHeadersProvider, cacheManager, logger);

            var response = new HttpResponseStub();

            response.Headers.Add("Content-Security-Policy", "xxxx");

            //Act
            service.AddContentSecurityPolicy(response);

            //Assert
            Assert.IsTrue(response.Headers.ContainsKey("Content-Security-Policy"));
            Assert.AreEqual(response.Headers.Count, 1);
            Assert.AreEqual(response.Headers.ContentSecurityPolicy, "xxxx");
        }

        [Test]
        public void AddHeaders_Test()
        {
            //Arrange
            var cspProvider = Substitute.For<ICspProvider>();
            var responseHeadersProvider = Substitute.For<IResponseHeadersProvider>();

            cacheManager.Get<IEnumerable<ResponseHeader>>(Constants.ResponseHeadersCacheKey, Arg.Any<Func<IEnumerable<ResponseHeader>>>(), Arg.Any<TimeSpan>())
                        .Returns(new List<ResponseHeader>() { new XFrameOptionsHeader() });

            var logger = Substitute.For<ILogger<JhooseSecurityService>>();

            var service = new JhooseSecurityService(cspProvider, responseHeadersProvider, cacheManager, logger);

            var response = new HttpResponseStub();

            //Act
            service.AddHeaders(response);

            //Assert
            Assert.IsTrue(response.Headers.ContainsKey("X-Frame-Options"));
            Assert.AreEqual(response.Headers.Count, 1);
        }

        [Test]
        public void AddHeaders_NoDuplicates_Test()
        {
            //Arrange
            var cspProvider = Substitute.For<ICspProvider>();
            var responseHeadersProvider = Substitute.For<IResponseHeadersProvider>();

            var logger = Substitute.For<ILogger<JhooseSecurityService>>();

            var service = new JhooseSecurityService(cspProvider, responseHeadersProvider, cacheManager, logger);

            var response = new HttpResponseStub();
            response.Headers.Add("X-Frame-Options", "xxxx");

            var headers = new List<ResponseHeader>()
            {
                new XFrameOptionsHeader()
                {
                }
            };

            //Act
            service.AddHeaders(response);

            //Assert
            Assert.IsTrue(response.Headers.ContainsKey("X-Frame-Options"));
            Assert.AreEqual(response.Headers.Count, 1);
            Assert.AreEqual(response.Headers.XFrameOptions, "xxxx");
        }
    }

    public class HttpResponseStub : HttpResponse
    {
        public override HttpContext HttpContext => throw new NotImplementedException();

        public override int StatusCode { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

        private IHeaderDictionary headers = new HeaderDictionary();
        public override IHeaderDictionary Headers => headers;

        public override Stream Body { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
        public override long? ContentLength { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
        public override string ContentType { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

        public override IResponseCookies Cookies => throw new NotImplementedException();

        public override bool HasStarted => throw new NotImplementedException();

        public override void OnCompleted(Func<object, Task> callback, object state)
        {
            throw new NotImplementedException();
        }

        public override void OnStarting(Func<object, Task> callback, object state)
        {
            throw new NotImplementedException();
        }

        public override void Redirect(string location, bool permanent)
        {
            throw new NotImplementedException();
        }
    }
}

#endif


