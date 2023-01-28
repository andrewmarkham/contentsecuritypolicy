# Jhoose Security module for Optimizely

This module adds several security features to an Optimizely website.

 - User interface to manage the CSP policy for your site. 
 - Add Recommended Security headers to the response headers.

 This module fully supports Episerver 11, .Net Framework 4.7.1 and Optimizely 12, .NET 5.0 and .Net 6.0

[![Jhoose Security](https://github.com/andrewmarkham/contentsecuritypolicy/actions/workflows/build-jhoose-security.yml/badge.svg?branch=main)](https://github.com/andrewmarkham/contentsecuritypolicy/actions/workflows/build-jhoose-security.yml)
[![Jhoose Security Core](https://github.com/andrewmarkham/contentsecuritypolicy/actions/workflows/build-jhoose-security-core.yml/badge.svg?branch=main)](https://github.com/andrewmarkham/contentsecuritypolicy/actions/workflows/build-jhoose-security-core.yml)

## Installation

Install the package directly from the Optimizley Nuget repository.  

``` 
dotnet add package Jhoose.Security.Admin
```

```
Install-Package Jhoose.Security.Admin
```

----

## Content Security Policy

- Interface to manage policies.
- Global '*report only*' mode, or specify for each policy.
- Ability to specify paths which are excluded from outputting the policy header.
  
Review the [Admin Interface](./documentation/admin-interface.md) documentation for more detail on how to manage the policies.

### Configuration (.NET 6.0)

*Startup.cs*
``` c#
using Jhoose.Security.DependencyInjection;
...
services.AddJhooseSecurity(_configuration);
```

The `Action<SecurityOptions> options` is optional and if not specified then the default will be used.

``` json
  "JhooseSecurity": {
    "ExclusionPaths": [
      "/episerver"
    ]
  },
```

*ExclusionPaths:* Any request which starts with a path specified in this property will not include the CSP header.

``` c#
app.UseJhooseSecurity();
```

#### Nonce tag helper
It is possible to get a nonce added to your inline `<script>` and `<style>` tags.

*_ViewImports.cshtml*
```
@addTagHelper *, Jhoose.Security.Core
```

``` html
<script nonce src="/assets/js/jquery.min.js"></script>
```

### Configuration (.Net Framework)
The following nodes will be added to the web.config file within your solution.
``` xml
<configSections>
	<sectionGroup name="JhooseSecurity" type="Jhoose.Security.Configuration.JhooseSecurityOptionsConfigurationSectionGroup, Jhoose.Security">
		<section name="Headers" type="Jhoose.Security.Configuration.HeadersSection, Jhoose.Security" />
		<section name="Options" type="Jhoose.Security.Configuration.OptionsSection, Jhoose.Security" />
	</sectionGroup>
</configSections>
```
Register the module with the .Net pipeline
``` xml
<system.webServer>
	<modules runAllManagedModulesForAllRequests="true">
		<add name="JhooseSecurityModule" type="Jhoose.Security.HttpModules.JhooseSecurityModule, Jhoose.Security" />
	</modules>
</system.webServer>   
```

Configuration options for the module
``` xml
<JhooseSecurity>
	<Options httpsRedirect="true">
		<Exclusions>
			<add path="/episerver" />
		</Exclusions>
	</Options>
</JhooseSecurity>
```

*Exclusions:* Any request which starts with a path specified in this property will not include the CSP header.
*httpsRedirect:* This attribute controls whether all requests should be upgraded to HTTPS.

#### Nonce HTML helper
It is possible to get a nonce added to your inline `<script>` and `<style>` tags.


``` html
@using Jhoose.Security.Core.HtmlHelpers;

<script @Html.AddNonce() src="/assets/js/jquery.min.js"></script>
```

## Recommended Security Headers

The following recommended security headers are now automatically added to the response header.

```
Strict-Transport-Security: max-age=31536000;
X-Frame-Options: deny
X-Content-Type-Options: nosniff
X-Permitted-Cross-Domain-Policies: none
Referrer-Policy: strict-origin-when-cross-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
```

The following headers are automatically removed
```
X-Powered-By: 
X-AspNet-Version: 
X-AspNetMvc-Version: 
```

The following headers cannot be removed programatically, but information about how to modify the web.config is contained below.

```
X-Powered-By: 
Server: 
```

### Configuration (.NET 6.0)

If you need to change the headers, then these are controlled in SecurityOptions class

``` json
"JhooseSecurity": {
   "HttpsRedirection":true,
   "StrictTransportSecurity":{
      "MaxAge":31536000,
      "IncludeSubDomains":true
   },
   "XFrameOptions":{
      "Enabled": true,
      "Mode":0,
      "Domain":""
   },
   "XPermittedCrossDomainPolicies":{
      "Mode":0
   },
   "ReferrerPolicy":{
      "Mode":0
   },
   "CrossOriginEmbedderPolicy":{
      "Mode":1
   },
   "CrossOriginOpenerPolicy":{
      "Mode":2
   },
   "CrossOriginResourcePolicy":{
      "Mode":1
   }
}
```

#### Server Header and X-Powered-By Header
These aren't removed, the reason being
1. When hosting within Optimizley DXP, the CDN will obfuscate the server value anyway.
2. The approach is different depending on how you are hosintg your site.

##### Kestrel
``` c#
    // program.cs
    .ConfigureWebHostDefaults(webBuilder =>
    {
        webBuilder.ConfigureKestrel(o => o.AddServerHeader = false);
        webBuilder.UseStartup<Startup>();
    });
```

##### IIS 10
``` xml
<!-- web.config -->
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <security>
            <requestFiltering removeServerHeader="true" />
        </security>

        <httpProtocol>
            <customHeaders>
                <clear />
                <remove name="X-Powered-By" />
            </customHeaders>
        </httpProtocol>
    </system.webServer>
</configuration>
```

### Configuration (.Net Framework)

The headers can be controlled within the web.config

``` xml
<JhooseSecurity>
	<Headers>
		<StrictTransportSecurityHeader enabled="true" maxAge="31536000" />
		<XFrameOptionsHeader enabled="true" mode="Deny|SameOrigin|AllowFrom" domain=""/>
		<XContentTypeOptionsHeader enabled="true" />
		<XPermittedCrossDomainPoliciesHeader enabled="true" mode="None|MasterOnly|ByContentType|All"/>
		<ReferrerPolicyHeader enabled="true" mode="NoReferrer|NoReferrerWhenDownGrade|Origin|OriginWhenCrossOrigin|SameOrigin|StrictOrigin|StrictOriginWhenCrossOrigin|UnsafeUrl"/>
		<CrossOriginEmbedderPolicyHeader enabled="true" mode ="UnSafeNone|RequireCorp"/>
		<CrossOriginOpenerPolicyHeader  enabled="true" mode="UnSafeNone|SameOriginAllowPopups|SameOrigin"/>
		<CrossOriginResourcePolicyHeader enabled="true" mode="SameSite|SameOrigin|CrossOrigin" />
	</Headers>
</JhooseSecurity>
```

#### Server Header and X-Powered-By Header
These aren't removed, the reason being
1. When hosting within Optimizley DXP, the CDN will obfuscate the searver value anyway.
2. The headers cannot be removed programatically.

##### IIS 10
``` xml
<!-- web.config -->
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <security>
            <requestFiltering removeServerHeader="true" />
        </security>

        <httpProtocol>
            <customHeaders>
                <clear />
                <remove name="X-Powered-By" />
            </customHeaders>
        </httpProtocol>
    </system.webServer>
</configuration>
```
 ---
 ## Version History

 |Version| Details|
 |:---|:---------------|
 |1.0|Initial Release|
 |1.1|Added Recommended Security Headers|
 |1.2|Ported to support Episerver 11 and .Net Framework 4.7.1<br/>Automatically remove (_X-AspNet-Version, X-AspNetMvc-Version_)|
 |1.3|Added .Net6 Support|
 |1.4|Included support for the Optimizely nonce service|
 |1.5|#64, #65 Resolved issue with duplicate headers being added and crashing the solution<br/>#70 Resolved issue the report-to directive being incorectly configured|