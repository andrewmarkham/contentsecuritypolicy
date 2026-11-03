/**
 * Extracts the Permissions-Policy compatibility data from @mdn/browser-compat-data
 * at build time, so the bundle doesn't include the entire (~18 MB) dataset.
 *
 * Generates Features/PermissionPolicy/Data/permissions-policy-compat.json
 *
 * Run: node scripts/extract-bcd-data.js
 */
const fs = require("fs");
const path = require("path");
const bcd = require("@mdn/browser-compat-data");

const permissionPolicy = bcd.http.headers["Permissions-Policy"];
const outFile = path.resolve(__dirname, "../Features/PermissionPolicy/Data/permissions-policy-compat.json");

const json = JSON.stringify(permissionPolicy);
fs.writeFileSync(outFile, json);

console.log(`permissions-policy-compat.json written (BCD ${bcd.__meta.version}, ${(Buffer.byteLength(json) / 1024).toFixed(1)} KB)`);
