/**
 * Removes the webpack output folder before a build, so stale bundles are never
 * packed into the NuGet package. Done once here rather than with webpack's
 * output.clean, because the app and editor builds share the same folder.
 *
 * Run: node scripts/clean-client-resources.js
 */
const fs = require("fs");
const path = require("path");

const clientResources = path.resolve(__dirname, "../../dist/Jhoose.Security/ClientResources");

fs.rmSync(clientResources, { recursive: true, force: true });

console.log(`Cleaned ${clientResources}`);
