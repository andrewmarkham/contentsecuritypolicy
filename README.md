# Jhoose Security module for Optimizely

This module adds several security features to an Optimizely website.

 - User interface to manage the Content Secutiry Policy (CSP) policy for your site. 
 - User interface to manage the Recommended Security headers and add to the response headers.

 This module fully supports
  - Optimizely 12, .NET (6.0-8.0) 
  - Episerver 11, .Net Framework 4.7.1 and Optimizely 12, .NET 5.0 [Legacy Documentation](./documentation/Legacy%20README.md)


[![Jhoose Security](https://github.com/andrewmarkham/contentsecuritypolicy/actions/workflows/build-jhoose-security.yml/badge.svg?branch=main)](https://github.com/andrewmarkham/contentsecuritypolicy/actions/workflows/build-jhoose-security.yml)

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

### Configuration

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

## Recommended Security Headers

The following recommended security headers are now automatically added to the response header.

The headers can be managed directly via configuration, or via a user interface.

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

### User Interface
When the user interface is enabled, the options set by the configuration method are ignored.

``` c#
services.AddJhooseSecurity(_configuration, (o) =>
{
    o.UseHeadersUI = true;
});
```
![image](./documentation/images/response-headers.png)

### Configuration

If you want to manage the headers via configuration then you will need to disable the interface first.

The values can be set using appSettings.json, or directly in the startup using the  SecurityOptions class.

``` c#
services.AddJhooseSecurity(_configuration, (o) =>
{
    o.UseHeadersUI = false;
    o.XFrameOptions.Mode = Jhoose.Security.Core.Models.SecurityHeaders.XFrameOptionsEnum.SameOrigin;
});
```

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

##Authentication
By default any user with the 'CmsAdmins' role can access the module, this can be changed at startup if you need to further restrict access.

``` C#
services.AddJhooseSecurity(_configuration,
    configurePolicy:   (p) =>
    {
        p.RequireRole("CspAdmin");
    });
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
 |1.5.2|Add support for ws and wss protocols<br/>Add support for seperate report-uri and report-to endpoints|
 |2.0.0|Removed support for CMS 11/.Net Framework<br/>Added support for .NET7 and .NET8<br/>New  interface for managing security headers (#74)<br/>Fix issues #79, #80, #81 (Supports Readonly mode)|
 |2.1.0|Add ability to customise the access policy for the module|