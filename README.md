# Content Security Policy for Optimizley

This repository contains an Optimizley plugin to manage and deliver the content security policy for your site.

[![Jhoose Security](https://github.com/andrewmarkham/contentsecuritypolicy/actions/workflows/build-jhoose-security.yml/badge.svg?branch=main)](https://github.com/andrewmarkham/contentsecuritypolicy/actions/workflows/build-jhoose-security.yml)
[![Jhoose Security Core](https://github.com/andrewmarkham/contentsecuritypolicy/actions/workflows/build-jhoose-security-core.yml/badge.svg?branch=main)](https://github.com/andrewmarkham/contentsecuritypolicy/actions/workflows/build-jhoose-security-core.yml)


## Features

- Interface to manage policies.
- Global '*report only*' mode, or specify for each policy.
- Ability to specify paths which are excluded from outputting the policy header.
  
Review the [Admin Interface](./documentation/admin-interface.md) documentation for more detail on how to manage the policies.

----

## Installation

Install the package directly from the Optimizley Nuget repository.  This will install the admin interface along with the middleware to add the CSP header to the response.  

``` 
dotnet add package Jhoose.Security.Admin
```

## Configuration

*Startup.cs*
``` c#
services.AddJhooseSecurity(IConfiguration configuration, Action<SecurityOptions> options = null);
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

### Nonce tag helper
It is possible to get a nonce added to your inline `<script>` and `<style>` tags.

*_ViewImports.cshtml*
```
@addTagHelper *, Jhoose.Security.Core
```

``` html
<script nonce src="/assets/js/jquery.min.js"></script>
```
## Recommended Security Headers

The following recommended security headers are now automatically output

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

If you need to change the headers, then these are controlled in SecurityOptions class

``` json
{
   "ExclusionPaths":[
      "/episerver"
   ],
   "HttpsRedirection":true,
   "StrictTransportSecurity":{
      "MaxAge":31536000,
      "IncludeSubDomains":true
   },
   "XFrameOptions":{
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