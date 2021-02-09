# Content Security Policy for Episerver

This repository contains an Episerver plugin to manage and deliver the content security policy for your site.


## Releases

TODO

----

## License
TODO

## Configuration

*Startup.cs*
``` c#
services.AddSecurity();
```

``` c#
app.UseContentSecuriyPolicy();
```

## Nonce tag helper
It is possible to get a nonce added to your inline `<script>` and `<style>` tags.

*_ViewImports.cshtml*
```
@addTagHelper *, Jhoose.Security.Core
```

``` html
<script nonce src="/assets/js/jquery.min.js"></script>
```
