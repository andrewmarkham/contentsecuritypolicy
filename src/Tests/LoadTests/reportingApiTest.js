import http from 'k6/http';
import { sleep } from 'k6';
import { check } from 'k6';

export const options = {
  scenarios: {
    steady_30_vus: {
      executor: 'constant-vus',
      vus: 30,
      duration: '5m',
    },
  },

  // Optional: set pass/fail thresholds for response time
  thresholds: {
    http_req_failed: ['rate<0.01'],          // <1% errors
    http_req_duration: ['p(95)<500'],        // 95% under 500ms (edit to your SLA)
  },
};

  const payload1 = JSON.stringify([
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    }
]);

  const payload10 = JSON.stringify([
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    }
]);
  const payload = JSON.stringify([
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 29160,
        "body": {
            "blockedURL": "https://images1.cmp.optimizely.com/Zz1iNDYxNTIxZTU0NDgxMWVmYTcyZDdlMmVhODJlZDNlNA==?width=1440",
            "disposition": "report",
            "documentURL": "https://localhost:5001/",
            "effectiveDirective": "img-src",
            "originalPolicy": "default-src 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-hashes' 'nonce-1ab05a2d-c56e-4ccf-9959-983d7dd2b5d3' ; script-src * 'unsafe-eval' http: https: mediastream: bbc.co.uk; style-src 'unsafe-eval' wss: ;  report-uri https://localhost:5001/api/reporting/;  report-to csp-endpoint;",
            "referrer": "",
            "sample": "",
            "statusCode": 200
        },
        "type": "csp-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 12025,
        "body": {
            "columnNumber": 53,
            "disposition": "enforce",
            "lineNumber": 1021,
            "message": "Permissions policy violation: camera is not allowed in this document.",
            "policyId": "camera",
            "sourceFile": "https://localhost:5001/"
        },
        "type": "permissions-policy-violation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    },
    {
        "age": 17955,
        "body": {
            "columnNumber": 20,
            "id": "UnloadHandler",
            "lineNumber": 17,
            "message": "Unload event listeners are deprecated and will be removed.",
            "sourceFile": "https://localhost:5001/Util/javascript/quicknavigator.js"
        },
        "type": "deprecation",
        "url": "https://localhost:5001/",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    }
]);

// The default exported function is gonna be picked up by k6 as the entry point for the test script. It will be executed repeatedly in "iterations" for the whole duration of the test.
export default function () {

  const url = 'https://localhost:5001/api/reporting';

  const params = {
    headers: {
      'Content-Type': 'application/problem+json',
    },
  };
  // Make a POST request to the target URL
   const res =  http.post(url, payload10, params);

     // check that response is 200
  check(res, {
    'response code was 200': (res) => res.status == 200,
  });
  
  // Sleep for 1 second to simulate real-world usage
  //sleep(1);
}