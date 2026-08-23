using System.Collections.Generic;

using Jhoose.Security.Features.ResponseHeaders.Models;

namespace Jhoose.Security.Configuration;

public enum IpRestrictionScope
{
    PublicSite,
    CmsSite,
    Both,

    /// <summary>
    /// IP restrictions are ignored entirely, regardless of the enable/disable mode configured in the admin UI.
    /// </summary>
    Off
}

public class JhooseSecurityOptions
{
    public JhooseSecurityOptions()
    {
        HttpsRedirection = true;
        StrictTransportSecurity = new StrictTransportSecurityHeader();
        XFrameOptions = new XFrameOptionsHeader();
        XContentTypeOptions = new XContentTypeOptionsHeader();
        XPermittedCrossDomainPolicies = new XPermittedCrossDomainPoliciesHeader() { Id = System.Guid.NewGuid() };
        ReferrerPolicy = new ReferrerPolicyHeader() { Id = System.Guid.NewGuid() };
        CrossOriginEmbedderPolicy = new CrossOriginEmbedderPolicyHeader() { Id = System.Guid.NewGuid() };
        CrossOriginOpenerPolicy = new CrossOriginOpenerPolicyHeader() { Id = System.Guid.NewGuid() };
        CrossOriginResourcePolicy = new CrossOriginResourcePolicyHeader() { Id = System.Guid.NewGuid() };
    }
    public const string JhooseSecurity = "JhooseSecurity";

    /// <summary>
    /// Paths excluded from CSP, security headers, the Permissions Policy, and (depending on
    /// <see cref="IpRestrictionScope"/>) IP restriction. Covers this module's own admin UI/API and
    /// the CMS edit-mode paths out of the box - extend this list if you install other admin modules
    /// (e.g. commerce management, a headless CMS UI, or third-party add-ons) with their own paths
    /// that should be treated the same way.
    /// </summary>
    public List<string> ExclusionPaths { get; set; } = ["/episerver", "/optimizely", "/api/jhoose"];

    /// <summary>
    /// Controls which parts of the application the IP restriction allow-list is enforced against.
    /// Set to <see cref="IpRestrictionScope.Off"/> to bypass IP restriction checks entirely.
    /// </summary>
    public IpRestrictionScope IpRestrictionScope { get; set; } = IpRestrictionScope.Both;

    public bool HttpsRedirection { get; set; }

    public bool UseHeadersUI { get; set; }

    public ReportingOptions Reporting { get; set; } = new ReportingOptions();

    public StrictTransportSecurityHeader StrictTransportSecurity { get; set; }
    public XFrameOptionsHeader XFrameOptions { get; set; }
    public XContentTypeOptionsHeader XContentTypeOptions { get; set; }
    public XPermittedCrossDomainPoliciesHeader XPermittedCrossDomainPolicies { get; set; }
    public ReferrerPolicyHeader ReferrerPolicy { get; set; }
    public CrossOriginEmbedderPolicyHeader CrossOriginEmbedderPolicy { get; set; }
    public CrossOriginOpenerPolicyHeader CrossOriginOpenerPolicy { get; set; }
    public CrossOriginResourcePolicyHeader CrossOriginResourcePolicy { get; set; }

    public IEnumerable<ResponseHeader> Headers
    {
        get
        {
            yield return this.StrictTransportSecurity;
            yield return this.XFrameOptions;
            yield return this.XContentTypeOptions;
            yield return this.XPermittedCrossDomainPolicies;
            yield return this.ReferrerPolicy;
            yield return this.CrossOriginEmbedderPolicy;
            yield return this.CrossOriginOpenerPolicy;
            yield return this.CrossOriginResourcePolicy;
        }
    }
}