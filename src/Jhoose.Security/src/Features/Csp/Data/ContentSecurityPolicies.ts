import { ContentSecurityPolicy } from "../Types/types";

export const ContentSecurityPolicyData: Record<string, ContentSecurityPolicy> = {
    "default-src": {
        order: 1,
        level: 1,
        summaryText: "The default-src directive defines the default policy for fetching resources such as JavaScript, Images, CSS, Fonts, AJAX requests, Frames, HTML5 Media. Not all directives fallback to default-src."
    },
    "script-src": {
        order: 2,
        level: 1,
        summaryText: "Defines valid sources of JavaScript."
    },
    "style-src": {
        order: 3,
        level: 1,
        summaryText: "Defines valid sources of stylesheets or CSS."
    },
    "img-src": {
        order: 4,
        level: 1,
        summaryText: "Defines valid sources of images."
    },
    "connect-src": {
        order: 5,
        level: 1,
        summaryText: "Applies to XMLHttpRequest (AJAX), WebSocket, fetch(), <a ping> or EventSource. If not allowed the browser emulates a 400 HTTP status code."
    },
    "font-src": {
        order: 6,
        level: 1,
        summaryText: "Defines valid sources of font resources (loaded via @font-face)."
    },
    "object-src": {
        order: 7,
        level: 1,
        summaryText: "Defines valid sources of plugins, eg &lt;object&gt;, &lt;embed&gt; or &lt;applet&gt;."
    },
    "media-src": {
        order: 8,
        level: 1,
        summaryText: "Defines valid sources of audio and video, eg HTML5 &lt;audio&gt;, &lt;video&gt; elements."
    },
    "frame-src": {
        order: 9,
        level: 1,
        summaryText: "Defines valid sources for loading frames. In CSP Level 2 frame-src was deprecated in favor of the child-src directive. CSP Level 3, has undeprecated frame-src and it will continue to defer to child-src if not present."
    },
    "sandbox": {
        order: 10,
        level: 1,
        summaryText: "Enables a sandbox for the requested resource similar to the iframe sandbox attribute. The sandbox applies a same origin policy, prevents popups, plugins and script execution is blocked. You can keep the sandbox value empty to keep all restrictions in place, or add values: allow-forms allow-same-origin allow-scripts allow-popups, allow-modals, allow-orientation-lock, allow-pointer-lock, allow-presentation, allow-popups-to-escape-sandbox, and allow-top-navigation"
    },
    "child-src": {
        order: 11,
        level: 2,
        summaryText: "Defines valid sources for web workers and nested browsing contexts loaded using elements such as &lt;frame&gt; and &lt;iframe&gt;"
    },
    "form-action": {
        order: 12,
        level: 2,
        summaryText: "Defines valid sources that can be used as an HTML &lt;form&gt; action."
    },
    "frame-ancestors": {
        order: 13,
        level: 2,
        summaryText: "Defines valid sources for embedding the resource using &lt;frame&gt; &lt;iframe&gt; &lt;object&gt; &lt;embed&gt; &lt;applet&gt;. Setting this directive to 'none' should be roughly equivalent to X-Frame-Options: DENY"
    },
    "base-uri": {
        order: 15,
        level: 2,
        summaryText: "Defines a set of allowed URLs which can be used in the src attribute of a HTML base tag."
    },
    "worker-src": {
        order: 16,
        level: 3,
        summaryText: "Restricts the URLs which may be loaded as a Worker, SharedWorker or ServiceWorker."
    },
    "manifest-src": {
        order: 17,
        level: 3,
        summaryText: "Restricts the URLs that application manifests can be loaded."
    },
    "prefetch-src": {
        order: 18,
        level: 3,
        summaryText: "Defines valid sources for request prefetch and prerendering, for example via the link tag with rel='prefetch' or rel='prerender'"
    },
    "navigate-to": {
        order: 19,
        level: 3,
        summaryText: "Restricts the URLs that the document may navigate to by any means. For example when a link is clicked, a form is submitted, or window.location is invoked. If form-action is present then this directive is ignored for form submissions."
    }
};


/**
    private readonly List<CspPolicy> defaultPolicies = new List<CspPolicy> {
        new CspPolicy { PolicyName = "default-src",     Order=1, Level = CspPolicyLevel.Level1,  SummaryText="<p>The default-src directive defines the default policy for fetching resources such as JavaScript, Images, CSS, Fonts, AJAX requests, Frames, HTML5 Media. Not all directives fallback to default-src.</p>", SchemaSource = new SchemaSource(), Options = new CspOptions() },
        new CspPolicy { PolicyName = "script-src",      Order=2, Level = CspPolicyLevel.Level1, SummaryText="<p>Defines valid sources of JavaScript.</p>", SchemaSource = new SchemaSource(), Options = new CspOptions() },
        new CspPolicy { PolicyName = "style-src",       Order=3, Level = CspPolicyLevel.Level1, SummaryText="<p>Defines valid sources of stylesheets or CSS.</p>", SchemaSource = new SchemaSource(), Options = new CspOptions() },
        new CspPolicy { PolicyName = "img-src",         Order=4, Level = CspPolicyLevel.Level1, SummaryText="<p>Defines valid sources of images.</p>", SchemaSource = new SchemaSource(), Options = new CspOptions() },
        new CspPolicy { PolicyName = "connect-src",     Order=5, Level = CspPolicyLevel.Level1, SummaryText="<p>Applies to XMLHttpRequest (AJAX), WebSocket, fetch(), <a ping> or EventSource. If not allowed the browser emulates a 400 HTTP status code.</p>", SchemaSource = new SchemaSource(), Options = new CspOptions() },
        new CspPolicy { PolicyName = "font-src",        Order=6, Level = CspPolicyLevel.Level1, SummaryText="<p>Defines valid sources of font resources (loaded via @font-face).</p>", SchemaSource = new SchemaSource(), Options = new CspOptions() },
        new CspPolicy { PolicyName = "object-src",      Order=7, Level = CspPolicyLevel.Level1, SummaryText="<p>Defines valid sources of plugins, eg &lt;object&gt;, &lt;embed&gt; or &lt;applet&gt;.</p>", SchemaSource = new SchemaSource(), Options = new CspOptions() },
        new CspPolicy { PolicyName = "media-src",       Order=8, Level = CspPolicyLevel.Level1, SummaryText="<p>Defines valid sources of audio and video, eg HTML5 &lt;audio&gt;, &lt;video&gt; elements.</p>", SchemaSource = new SchemaSource(), Options = new CspOptions() },
        new CspPolicy { PolicyName = "frame-src",       Order=9, Level = CspPolicyLevel.Level1, SummaryText="<p>Defines valid sources for loading frames. In CSP Level 2 frame-src was deprecated in favor of the child-src directive. CSP Level 3, has undeprecated frame-src and it will continue to defer to child-src if not present.</p>", SchemaSource = new SchemaSource(), Options = new CspOptions() },

        new CspPolicy { PolicyName = "sandbox",
            Order=10,
            Level = CspPolicyLevel.Level1,
            SummaryText="<p>Enables a sandbox for the requested resource similar to the iframe sandbox attribute. The sandbox applies a same origin policy, prevents popups, plugins and script execution is blocked. You can keep the sandbox value empty to keep all restrictions in place, or add values: allow-forms allow-same-origin allow-scripts allow-popups, allow-modals, allow-orientation-lock, allow-pointer-lock, allow-presentation, allow-popups-to-escape-sandbox, and allow-top-navigation</p>",
            SandboxOptions = new SandboxOptions(),
            Options = null,
            SchemaSource = null },

        new CspPolicy { PolicyName = "child-src",       Order=11, Level = CspPolicyLevel.Level2, SummaryText="<p>Defines valid sources for web workers and nested browsing contexts loaded using elements such as &lt;frame&gt; and &lt;iframe&gt;</p>", SchemaSource = new SchemaSource(), Options = new CspOptions() },
        new CspPolicy { PolicyName = "form-action",     Order=12, Level = CspPolicyLevel.Level2, SummaryText="<p>Defines valid sources that can be used as an HTML &lt;form&gt; action.</p>", SchemaSource = new SchemaSource(), Options = new CspOptions() },
        new CspPolicy { PolicyName = "frame-ancestors", Order=13, Level = CspPolicyLevel.Level2, SummaryText="<p>Defines valid sources for embedding the resource using &lt;frame&gt; &lt;iframe&gt; &lt;object&gt; &lt;embed&gt; &lt;applet&gt;. Setting this directive to 'none' should be roughly equivalent to X-Frame-Options: DENY</p>", SchemaSource = new SchemaSource(), Options = new CspOptions() },

        new CspPolicy { PolicyName = "base-uri",        Order=15, Level = CspPolicyLevel.Level2, SummaryText="<p>Defines a set of allowed URLs which can be used in the src attribute of a HTML base tag.</p>", SchemaSource = new SchemaSource(), Options = new CspOptions() },
        new CspPolicy { PolicyName = "worker-src",      Order=16, Level = CspPolicyLevel.Level3, SummaryText="<p>Restricts the URLs which may be loaded as a Worker, SharedWorker or ServiceWorker.</p>", SchemaSource = new SchemaSource(), Options = new CspOptions() },
        new CspPolicy { PolicyName = "manifest-src",    Order=17, Level = CspPolicyLevel.Level3, SummaryText="<p>Restricts the URLs that application manifests can be loaded.</p>", SchemaSource = new SchemaSource(), Options = new CspOptions() },
        new CspPolicy { PolicyName = "prefetch-src",    Order=18, Level = CspPolicyLevel.Level3, SummaryText="<p>Defines valid sources for request prefetch and prerendering, for example via the link tag with rel='prefetch' or rel='prerender'</p>", SchemaSource = new SchemaSource(), Options = new CspOptions() },
        new CspPolicy { PolicyName = "navigate-to",     Order=19, Level = CspPolicyLevel.Level3, SummaryText="<p>Restricts the URLs that the document may navigate to by any means. For example when a link is clicked, a form is submitted, or window.location is invoked. If form-action is present then this directive is ignored for form submissions.</p>", SchemaSource = new SchemaSource(), Options = new CspOptions() }
    };
 */
