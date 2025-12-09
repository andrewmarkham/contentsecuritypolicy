using System;
using System.Collections.Generic;
using System.Text.Json;

using Jhoose.Security.Features.ResponseHeaders.Models;
using Jhoose.Security.Features.ResponseHeaders.Repository;

using NUnit.Framework;

namespace Jhoose.Security.Tests.Repository
{
    [TestFixture]
    public class FixResponseHeaderHelper_Tests
    {
        [TestCaseSource(typeof(FixResponseHeaderTestDataClass), nameof(FixResponseHeaderTestDataClass.TestTypes))]
        public bool IsFixRequired_Tests(ResponseHeader header, string typeName)
        {
            var retVal = FixResponseHeaderHelper.IsFixRequired(header,typeName);
            return retVal;
        }

        [Test]
        public void IsFixRequired_ReturnsTrue_ForResponseHeaderType()
        {
            var typeName = typeof(ResponseHeader).AssemblyQualifiedName!;

            var requiresFix = FixResponseHeaderHelper.IsFixRequired(new ResponseHeader(), typeName);

            Assert.That(requiresFix, Is.True);
        }
        
        [Test]
        public void IsFixRequired_ReturnsFalse_ForResponseHeaderType()
        {
            var typeName = typeof(StrictTransportSecurityHeader).AssemblyQualifiedName!;

            var requiresFix = FixResponseHeaderHelper.IsFixRequired(new StrictTransportSecurityHeader(), typeName);

            Assert.That(requiresFix, Is.False);
        }
        [Test]
        public void IsFixRequired_ReturnsTrue_ForConcreteHeaderType()
        {
            var typeName = typeof(StrictTransportSecurityHeader).AssemblyQualifiedName!;

            var requiresFix = FixResponseHeaderHelper.IsFixRequired(new ResponseHeader(), typeName);

            Assert.That(requiresFix, Is.True);
        }

        [Test]
        public void IsFixRequired_ReturnsFalse_ForConcreteHeaderType1()
        {
            var typeName = typeof(StrictTransportSecurityHeader).AssemblyQualifiedName!;

            var requiresFix = FixResponseHeaderHelper.IsFixRequired(new StrictTransportSecurityHeader(), typeName);

            Assert.That(requiresFix, Is.False);
        }

        [TestCaseSource(nameof(Issues_of_Incorrect_Serialization))]
        public void ApplyFix_RehydratesKnownHeaders_Issues_of_Incorrect_Serialization(string json, Type expectedType, Action<ResponseHeader> assertResult)
        {
            var original = JsonSerializer.Deserialize<ResponseHeader>(json);

            Assert.That(original, Is.Not.Null, "Deserialization should produce a response header");

            var result = FixResponseHeaderHelper.ApplyFix(original!, json);

            Assert.That(result, Is.TypeOf(expectedType));
            assertResult(result);
        }

        [TestCaseSource(nameof(Issues_of_Incorrect_Deserialization))]
        public void ApplyFix_RehydratesKnownHeaders_Issues_of_Incorrect_Deserialization(string typeName, string json, Type expectedType, Action<ResponseHeader> assertResult)
        {
            var original = JsonSerializer.Deserialize<ResponseHeader>(json);

            Assert.That(original, Is.Not.Null, "Deserialization should produce a response header");

            var fixRequired = FixResponseHeaderHelper.IsFixRequired(original,typeName);
            Assert.That(fixRequired, Is.True, "Fix should be required for ResponseHeader type");

            var result = FixResponseHeaderHelper.ApplyFix(original!, json);

            Assert.That(result, Is.TypeOf(expectedType));
            assertResult(result);
        }

        private static IEnumerable<TestCaseData> Issues_of_Incorrect_Serialization()
        {
            yield return new TestCaseData(
                "{\"Id\":\"a2fd4a4a-eb3a-487f-ab7f-c5bf6232be8f\",\"Enabled\":true,\"Name\":\"Strict-Transport-Security\",\"Value\":\"max-age=3153; includeSubDomains\"}",
                typeof(StrictTransportSecurityHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (StrictTransportSecurityHeader)result;
                    Assert.That(header.MaxAge, Is.EqualTo(3153));
                    Assert.That(header.IncludeSubDomains, Is.True);
                }))
                .SetName("StrictTransportSecurityHeader_IncludeSubDomains");
            
            yield return new TestCaseData(
                "{\"Id\":\"a2fd4a4a-eb3a-487f-ab7f-c5bf6232be8f\",\"Enabled\":true,\"Name\":\"Strict-Transport-Security\",\"Value\":\"max-age=3153;\"}",
                typeof(StrictTransportSecurityHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (StrictTransportSecurityHeader)result;
                    Assert.That(header.MaxAge, Is.EqualTo(3153));
                    Assert.That(header.IncludeSubDomains, Is.False);
                }))
                .SetName("StrictTransportSecurityHeader_NoIncludeSubDomains");
            
            yield return new TestCaseData(
                "{\"Id\":\"2720ed80-24ac-422f-8e9d-e1b5e6e08bd2\",\"Enabled\":true,\"Name\":\"X-Frame-Options\",\"Value\":\"deny\"}",
                typeof(XFrameOptionsHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (XFrameOptionsHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(XFrameOptionsEnum.Deny));
                }))
                .SetName("XFrameOptionsHeader_Deny");
            
            yield return new TestCaseData(
                "{\"Id\":\"2720ed80-24ac-422f-8e9d-e1b5e6e08bd2\",\"Enabled\":true,\"Name\":\"X-Frame-Options\",\"Value\":\"sameorigin\"}",
                typeof(XFrameOptionsHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (XFrameOptionsHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(XFrameOptionsEnum.SameOrigin));
                }))
                .SetName("XFrameOptionsHeader_SameOrigin");
        
            yield return new TestCaseData(
                "{\"Id\":\"2720ed80-24ac-422f-8e9d-e1b5e6e08bd2\",\"Enabled\":true,\"Name\":\"X-Frame-Options\",\"Value\":\"allow-from: example.com\"}",
                typeof(XFrameOptionsHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (XFrameOptionsHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(XFrameOptionsEnum.AllowFrom));
                    Assert.That(header.Domain, Is.EqualTo("example.com"));
                }))
                .SetName("XFrameOptionsHeader_AllowFrom");

            yield return new TestCaseData(
                "{\"Id\":\"cb5d61f5-cf4a-4f0c-96d5-8c5e858e0311\",\"Enabled\":true,\"Name\":\"X-Content-Type-Options\",\"Value\":\"nosniff\"}",
                typeof(XContentTypeOptionsHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (XContentTypeOptionsHeader)result;
                    Assert.That(header.Value, Is.EqualTo("nosniff"));
                }))
                .SetName("XContentTypeOptionsHeader_NoSniff");
            
            yield return new TestCaseData(
                "{\"Id\":\"0fd44821-0e2f-4a01-8950-4dc6f5c66702\",\"Enabled\":true,\"Name\":\"Referrer-Policy\",\"Value\":\"no-referrer\"}",
                typeof(ReferrerPolicyHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (ReferrerPolicyHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(ReferrerPolicyEnum.NoReferrer));
                }))
                .SetName("ReferrerPolicyHeader_NoReferrer");

            yield return new TestCaseData(
                "{\"Id\":\"0fd44821-0e2f-4a01-8950-4dc6f5c66702\",\"Enabled\":true,\"Name\":\"Referrer-Policy\",\"Value\":\"no-referrer-when-downgrade\"}",
                typeof(ReferrerPolicyHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (ReferrerPolicyHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(ReferrerPolicyEnum.NoReferrerWhenDownGrade));
                }))
                .SetName("ReferrerPolicyHeader_NoReferrerWhenDowngrade");

            yield return new TestCaseData(
                "{\"Id\":\"0fd44821-0e2f-4a01-8950-4dc6f5c66702\",\"Enabled\":true,\"Name\":\"Referrer-Policy\",\"Value\":\"origin\"}",
                typeof(ReferrerPolicyHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (ReferrerPolicyHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(ReferrerPolicyEnum.Origin));
                }))
                .SetName("ReferrerPolicyHeader_Origin");

            yield return new TestCaseData(
                "{\"Id\":\"0fd44821-0e2f-4a01-8950-4dc6f5c66702\",\"Enabled\":true,\"Name\":\"Referrer-Policy\",\"Value\":\"origin-when-cross-origin\"}",
                typeof(ReferrerPolicyHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (ReferrerPolicyHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(ReferrerPolicyEnum.OriginWhenCrossOrigin));
                }))
                .SetName("ReferrerPolicyHeader_OriginWhenCrossOrigin");

            yield return new TestCaseData(
                "{\"Id\":\"0fd44821-0e2f-4a01-8950-4dc6f5c66702\",\"Enabled\":true,\"Name\":\"Referrer-Policy\",\"Value\":\"same-origin\"}",
                typeof(ReferrerPolicyHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (ReferrerPolicyHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(ReferrerPolicyEnum.SameOrigin));
                }))
                .SetName("ReferrerPolicyHeader_SameOrigin");

            yield return new TestCaseData(
                "{\"Id\":\"0fd44821-0e2f-4a01-8950-4dc6f5c66702\",\"Enabled\":true,\"Name\":\"Referrer-Policy\",\"Value\":\"strict-origin\"}",
                typeof(ReferrerPolicyHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (ReferrerPolicyHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(ReferrerPolicyEnum.StrictOrigin));
                }))
                .SetName("ReferrerPolicyHeader_StrictOrigin");

            yield return new TestCaseData(
                "{\"Id\":\"0fd44821-0e2f-4a01-8950-4dc6f5c66702\",\"Enabled\":true,\"Name\":\"Referrer-Policy\",\"Value\":\"strict-origin-when-cross-origin\"}",
                typeof(ReferrerPolicyHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (ReferrerPolicyHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(ReferrerPolicyEnum.StrictOriginWhenCrossOrigin));
                }))
                .SetName("ReferrerPolicyHeader_StrictOriginWhenCrossOrigin");

            yield return new TestCaseData(
                "{\"Id\":\"0fd44821-0e2f-4a01-8950-4dc6f5c66702\",\"Enabled\":true,\"Name\":\"Referrer-Policy\",\"Value\":\"unsafe-url\"}",
                typeof(ReferrerPolicyHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (ReferrerPolicyHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(ReferrerPolicyEnum.UnsafeUrl));
                }))
                .SetName("ReferrerPolicyHeader_UnsafeUrl");

            yield return new TestCaseData(
                "{\"Id\":\"51d66978-6f81-46c5-82f2-a275ebf63450\",\"Enabled\":true,\"Name\":\"Cross-Origin-Embedder-Policy\",\"Value\":\"require-corp\"}",
                typeof(CrossOriginEmbedderPolicyHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (CrossOriginEmbedderPolicyHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(CrossOriginEmbedderPolicyEnum.RequireCorp));
                }))
                .SetName("CrossOriginEmbedderPolicyHeader_RequireCorp");
            
            yield return new TestCaseData(
                "{\"Id\":\"51d66978-6f81-46c5-82f2-a275ebf63450\",\"Enabled\":true,\"Name\":\"Cross-Origin-Embedder-Policy\",\"Value\":\"unsafe-none\"}",
                typeof(CrossOriginEmbedderPolicyHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (CrossOriginEmbedderPolicyHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(CrossOriginEmbedderPolicyEnum.UnSafeNone));
                }))
                .SetName("CrossOriginEmbedderPolicyHeader_UnSafeNone");

            yield return new TestCaseData(
                "{\"Id\":\"2b857fc0-b1f1-417b-9f7f-3d73e317365d\",\"Enabled\":true,\"Name\":\"Cross-Origin-Opener-Policy\",\"Value\":\"same-origin\"}",
                typeof(CrossOriginOpenerPolicyHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (CrossOriginOpenerPolicyHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(CrossOriginOpenerPolicyEnum.SameOrigin));
                }))
                .SetName("CrossOriginOpenerPolicyHeader_SameOrigin");
            
            yield return new TestCaseData(
                "{\"Id\":\"2b857fc0-b1f1-417b-9f7f-3d73e317365d\",\"Enabled\":true,\"Name\":\"Cross-Origin-Opener-Policy\",\"Value\":\"same-origin-allow-popups\"}",
                typeof(CrossOriginOpenerPolicyHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (CrossOriginOpenerPolicyHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(CrossOriginOpenerPolicyEnum.SameOriginAllowPopups));
                }))
                .SetName("CrossOriginOpenerPolicyHeader_SameOrigin");

            yield return new TestCaseData(
                "{\"Id\":\"2b857fc0-b1f1-417b-9f7f-3d73e317365d\",\"Enabled\":true,\"Name\":\"Cross-Origin-Opener-Policy\",\"Value\":\"unsafe-none\"}",
                typeof(CrossOriginOpenerPolicyHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (CrossOriginOpenerPolicyHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(CrossOriginOpenerPolicyEnum.UnSafeNone));
                }))
                .SetName("CrossOriginOpenerPolicyHeader_UnSafeNone");

            yield return new TestCaseData(
                "{\"Id\":\"322a7470-2212-40a4-99f6-059032b62c56\",\"Enabled\":false,\"Name\":\"Cross-Origin-Resource-Policy\",\"Value\":\"same-origin\"}",
                typeof(CrossOriginResourcePolicyHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (CrossOriginResourcePolicyHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(CrossOriginResourcePolicyEnum.SameOrigin));
                }))
                .SetName("CrossOriginResourcePolicyHeader_SameOrigin");

            yield return new TestCaseData(
                "{\"Id\":\"322a7470-2212-40a4-99f6-059032b62c56\",\"Enabled\":false,\"Name\":\"Cross-Origin-Resource-Policy\",\"Value\":\"cross-origin\"}",
                typeof(CrossOriginResourcePolicyHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (CrossOriginResourcePolicyHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(CrossOriginResourcePolicyEnum.CrossOrigin));
                }))
                .SetName("CrossOriginResourcePolicyHeader_CrossOrigin");

            yield return new TestCaseData(
                "{\"Id\":\"322a7470-2212-40a4-99f6-059032b62c56\",\"Enabled\":false,\"Name\":\"Cross-Origin-Resource-Policy\",\"Value\":\"same-site\"}",
                typeof(CrossOriginResourcePolicyHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (CrossOriginResourcePolicyHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(CrossOriginResourcePolicyEnum.SameSite));
                }))
                .SetName("CrossOriginResourcePolicyHeader_SameSite");

            yield return new TestCaseData(
                "{\"Id\":\"322a7470-2212-40a4-99f6-059032b62c56\",\"Enabled\":false,\"Name\":\"X-Permitted-Cross-Domain-Policies\",\"Value\":\"none\"}",
                typeof(XPermittedCrossDomainPoliciesHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (XPermittedCrossDomainPoliciesHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(XPermittedCrossDomainPoliciesEnum.None));
                }))
                .SetName("XPermittedCrossDomainPoliciesHeader_None");

            yield return new TestCaseData(
                "{\"Id\":\"322a7470-2212-40a4-99f6-059032b62c56\",\"Enabled\":false,\"Name\":\"X-Permitted-Cross-Domain-Policies\",\"Value\":\"master-only\"}",
                typeof(XPermittedCrossDomainPoliciesHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (XPermittedCrossDomainPoliciesHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(XPermittedCrossDomainPoliciesEnum.MasterOnly));
                }))
                .SetName("XPermittedCrossDomainPoliciesHeader_MasterOnly");

            yield return new TestCaseData(
                "{\"Id\":\"322a7470-2212-40a4-99f6-059032b62c56\",\"Enabled\":false,\"Name\":\"X-Permitted-Cross-Domain-Policies\",\"Value\":\"by-content-type\"}",
                typeof(XPermittedCrossDomainPoliciesHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (XPermittedCrossDomainPoliciesHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(XPermittedCrossDomainPoliciesEnum.ByContentType));
                }))
                .SetName("XPermittedCrossDomainPoliciesHeader_ByContentType");

            yield return new TestCaseData(
                "{\"Id\":\"322a7470-2212-40a4-99f6-059032b62c56\",\"Enabled\":false,\"Name\":\"X-Permitted-Cross-Domain-Policies\",\"Value\":\"all\"}",
                typeof(XPermittedCrossDomainPoliciesHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (XPermittedCrossDomainPoliciesHeader)result;
                    Assert.That(header.Mode, Is.EqualTo(XPermittedCrossDomainPoliciesEnum.All));
                }))
                .SetName("XPermittedCrossDomainPoliciesHeader_All");
        }
    
        private static IEnumerable<TestCaseData> Issues_of_Incorrect_Deserialization()
        {
            yield return new TestCaseData(
                "Jhoose.Security.Core.Models.SecurityHeaders.StrictTransportSecurityHeader, Jhoose.Security.Core, Version=2.4.2.335, Culture=neutral, PublicKeyToken=null",
                "{\"Name\":\"Strict-Transport-Security\",\"Value\":\"max-age=3153; includeSubDomains\",\"MaxAge\":31536000,\"IncludeSubDomains\":true,\"Id\":\"742d4f0c-7119-4f43-9d7c-0630de774f06\",\"Enabled\":true}",
                typeof(StrictTransportSecurityHeader),
                (Action<ResponseHeader>)(result =>
                {
                    var header = (StrictTransportSecurityHeader)result;
                    Assert.That(header.MaxAge, Is.EqualTo(3153));
                    Assert.That(header.IncludeSubDomains, Is.True);
                }))
                .SetName("StrictTransportSecurityHeader_IncludeSubDomains");
        }
    }

    public class FixResponseHeaderTestDataClass
    {
        public static IEnumerable<TestCaseData> TestTypes
        {
            get
            {
                yield return new TestCaseData(new ResponseHeader(), typeof(ResponseHeader).AssemblyQualifiedName!).Returns(true);
                yield return new TestCaseData(new ResponseHeader(), typeof(CrossOriginEmbedderPolicyHeader).AssemblyQualifiedName!).Returns(true);
                yield return new TestCaseData(new ResponseHeader(), typeof(CrossOriginOpenerPolicyHeader).AssemblyQualifiedName!).Returns(true);
                yield return new TestCaseData(new ResponseHeader(), typeof(CrossOriginResourcePolicyHeader).AssemblyQualifiedName!).Returns(true);
                yield return new TestCaseData(new ResponseHeader(), typeof(ReferrerPolicyHeader).AssemblyQualifiedName!).Returns(true);
                yield return new TestCaseData(new ResponseHeader(), typeof(StrictTransportSecurityHeader).AssemblyQualifiedName!).Returns(true);
                yield return new TestCaseData(new ResponseHeader(), typeof(XContentTypeOptionsHeader).AssemblyQualifiedName!).Returns(true);
                yield return new TestCaseData(new ResponseHeader(), typeof(XFrameOptionsHeader).AssemblyQualifiedName!).Returns(true);
                yield return new TestCaseData(new ResponseHeader(), typeof(XPermittedCrossDomainPoliciesHeader).AssemblyQualifiedName!).Returns(true);

                yield return new TestCaseData(new CrossOriginEmbedderPolicyHeader(), typeof(ResponseHeader).AssemblyQualifiedName!).Returns(true);
                yield return new TestCaseData(new CrossOriginEmbedderPolicyHeader(), typeof(CrossOriginEmbedderPolicyHeader).AssemblyQualifiedName!).Returns(false);
                yield return new TestCaseData(new CrossOriginOpenerPolicyHeader(), typeof(CrossOriginOpenerPolicyHeader).AssemblyQualifiedName!).Returns(false);
                yield return new TestCaseData(new CrossOriginResourcePolicyHeader(), typeof(CrossOriginResourcePolicyHeader).AssemblyQualifiedName!).Returns(false);
                yield return new TestCaseData(new ReferrerPolicyHeader(), typeof(ReferrerPolicyHeader).AssemblyQualifiedName!).Returns(false);
                yield return new TestCaseData(new StrictTransportSecurityHeader(), typeof(StrictTransportSecurityHeader).AssemblyQualifiedName!).Returns(false);
                yield return new TestCaseData(new XContentTypeOptionsHeader(), typeof(XContentTypeOptionsHeader).AssemblyQualifiedName!).Returns(false);
                yield return new TestCaseData(new XFrameOptionsHeader(), typeof(XFrameOptionsHeader).AssemblyQualifiedName!).Returns(false);
                yield return new TestCaseData(new XPermittedCrossDomainPoliciesHeader(), typeof(XPermittedCrossDomainPoliciesHeader).AssemblyQualifiedName!).Returns(false);
            }
        }
    }
}
