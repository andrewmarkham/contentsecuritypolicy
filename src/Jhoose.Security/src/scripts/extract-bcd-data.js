/**
 * Extracts Permissions-Policy data from @mdn/browser-compat-data at build time
 * so we don't bundle the entire 17.9 MiB dataset.
 *
 * Generates:
 *   - permissions-policy-compat.json  (browser compatibility per directive)
 *   - browser-details.json            (browser display names + logo URLs)
 *   - permission-policy-directives.json (directive list with descriptions)
 *
 * Run: node scripts/extract-bcd-data.js
 */
const fs = require("fs");
const path = require("path");

const bcd = require("@mdn/browser-compat-data");
const permissionPolicy = bcd.http.headers["Permissions-Policy"];

const outDir = path.resolve(__dirname, "../Features/PermissionPolicy/Data");
fs.mkdirSync(outDir, { recursive: true });

// --- 1. permissions-policy-compat.json (browser compat data per directive) ---
const compatPath = path.join(outDir, "permissions-policy-compat.json");
fs.writeFileSync(compatPath, JSON.stringify(permissionPolicy, null, 2));
console.log(
  `  permissions-policy-compat.json (${(Buffer.byteLength(JSON.stringify(permissionPolicy)) / 1024).toFixed(1)} KB)`,
);

// --- 2. browser-details.json (name + logo for each browser key) ---
const logoUrls = {
  chrome:
    "https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome_48x48.png",
  firefox:
    "https://raw.githubusercontent.com/alrra/browser-logos/main/src/firefox/firefox_48x48.png",
  safari:
    "https://raw.githubusercontent.com/alrra/browser-logos/main/src/safari/safari_48x48.png",
  edge: "https://raw.githubusercontent.com/alrra/browser-logos/main/src/edge/edge_48x48.png",
  opera:
    "https://raw.githubusercontent.com/alrra/browser-logos/main/src/opera/opera_48x48.png",
  ie: "https://raw.githubusercontent.com/alrra/browser-logos/main/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png",
  firefox_android:
    "https://raw.githubusercontent.com/alrra/browser-logos/main/src/firefox/firefox_48x48.png",
  chrome_android:
    "https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome_48x48.png",
  edge_android:
    "https://raw.githubusercontent.com/alrra/browser-logos/main/src/edge/edge_48x48.png",
  samsunginternet_android:
    "https://raw.githubusercontent.com/alrra/browser-logos/main/src/samsung-internet/samsung-internet_48x48.png",
  opera_android:
    "https://raw.githubusercontent.com/alrra/browser-logos/main/src/opera/opera_48x48.png",
  webview_android:
    "https://raw.githubusercontent.com/alrra/browser-logos/main/src/android-webview/android-webview_48x48.png",
  webview_ios:
    "https://raw.githubusercontent.com/alrra/browser-logos/main/src/safari/safari_48x48.png",
  safari_ios:
    "https://raw.githubusercontent.com/alrra/browser-logos/main/src/safari/safari_48x48.png",
  oculus:
    "data:image/png;base64,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",
};

// Collect all browser keys referenced in Permissions-Policy support data
const supportBrowsers = new Set();
for (const [key, value] of Object.entries(permissionPolicy)) {
  if (key === "__compat") {
    const support = value.__compat?.support || value.support;
    if (support) Object.keys(support).forEach((b) => supportBrowsers.add(b));
  } else if (value?.__compat?.support) {
    Object.keys(value.__compat.support).forEach((b) => supportBrowsers.add(b));
  }
}

const browserDetails = {};
for (const key of [...supportBrowsers].sort()) {
  const bcdBrowser = bcd.browsers[key];
  const name = bcdBrowser?.name || key;
  const logoUrl = logoUrls[key];
  if (logoUrl) {
    browserDetails[key] = { name, logoUrl };
  }
}

const browserPath = path.join(outDir, "browser-details.json");
fs.writeFileSync(browserPath, JSON.stringify(browserDetails, null, 2));
console.log(
  `  browser-details.json (${(Buffer.byteLength(JSON.stringify(browserDetails)) / 1024).toFixed(1)} KB)`,
);

// --- 3. permission-policy-directives.json (directive list) ---

// Manual overlay for descriptions and defaults that BCD doesn't provide.
// New directives from BCD not listed here will be auto-included with placeholder values.
const directiveOverlay = {
  accelerometer: {
    description:
      "Controls whether the document can access the Accelerometer interface to read device acceleration.",
    defaultAllowlist: "self",
    notes: "Experimental / not widely implemented",
  },
  "ambient-light-sensor": {
    description:
      "Controls access to the AmbientLightSensor API to measure ambient light levels.",
    defaultAllowlist: "self",
    notes: "Experimental / not widely implemented",
  },
  "aria-notify": {
    description:
      "Controls whether the current document is allowed to use the ariaNotify() method to fire screen reader announcements.",
    defaultAllowlist: "self",
    notes: "",
  },
  "attribution-reporting": {
    description:
      "Allows use of the Attribution Reporting API (privacy-sandbox / ad measurement).",
    defaultAllowlist: "*",
    notes: "Under development in Chromium / related to ad-tech proposals",
  },
  autoplay: {
    description:
      "Controls whether video / audio elements in the page (or embedded frames) can start playing automatically without user interaction.",
    defaultAllowlist: "*",
    notes: "Used in many browsers already",
  },
  bluetooth: {
    description:
      "Controls whether the current document is allowed to use the Web Bluetooth API.",
    defaultAllowlist: "self",
    notes: "",
  },
  "browsing-topics": {
    description:
      "Controls access to the Topics API (interest cohort / user topics) for personalization / advertising.",
    defaultAllowlist: "*",
    notes: "Privacy-sandbox API; not implemented in all browsers",
  },
  camera: {
    description:
      "Controls whether the document can use the camera (e.g. via getUserMedia).",
    defaultAllowlist: "self",
    notes: "A powerful feature; will require user permission if allowed",
  },
  "captured-surface-control": {
    description:
      "Controls whether or not the document is permitted to use the Captured Surface Control API.",
    defaultAllowlist: "self",
    notes: "",
  },
  "compute-pressure": {
    description: "Controls access to the Compute Pressure API.",
    defaultAllowlist: "self",
    notes: "",
  },
  "cross-origin-isolated": {
    description:
      "Controls whether the current document is allowed to use APIs that require cross-origin isolation.",
    defaultAllowlist: "self",
    notes: "",
  },
  "deferred-fetch": {
    description:
      "The deferred-fetch Permissions-Policy directive is part of the fetchLater() API.",
    defaultAllowlist: "self",
    notes: "",
  },
  "deferred-fetch-minimal": {
    description:
      "The deferred-fetch-minimal Permissions-Policy directive is part of the fetchLater() API.",
    defaultAllowlist: "*",
    notes: "",
  },
  "display-capture": {
    description:
      "Controls ability to capture the screen or display (e.g. using getDisplayMedia).",
    defaultAllowlist: "self",
    notes: 'Often grouped under "screen capture" in browser feature sets',
  },
  "encrypted-media": {
    description:
      "Controls whether Encrypted Media Extensions (EME) can be used (for DRM playback).",
    defaultAllowlist: "*",
    notes: "Media DRM APIs",
  },
  fullscreen: {
    description: "Controls whether the document can use the Fullscreen API.",
    defaultAllowlist: "*",
    notes: "",
  },
  gamepad: {
    description:
      "Controls whether the current document is allowed to use the Gamepad API.",
    defaultAllowlist: "self",
    notes: "",
  },
  geolocation: {
    description:
      "Controls whether the document can request geolocation (via the Geolocation API).",
    defaultAllowlist: "self",
    notes:
      "If blocked, calls to getCurrentPosition / watchPosition will error with PERMISSION_DENIED.",
  },
  gyroscope: {
    description:
      "Controls access to the Gyroscope sensor interface (rotation rate).",
    defaultAllowlist: "self",
    notes: "Experimental / sensor API",
  },
  hid: {
    description:
      "Controls whether the current document is allowed to use the WebHID API to connect to uncommon or exotic human interface devices.",
    defaultAllowlist: "self",
    notes: "",
  },
  "identity-credentials-get": {
    description:
      "Controls whether the document can request federated credentials or identity credential objects.",
    defaultAllowlist: "self",
    notes: "Under development for federated login / identity APIs",
  },
  "idle-detection": {
    description:
      "Controls whether the current document is allowed to use the Idle Detection API to detect when users are interacting with their devices.",
    defaultAllowlist: "self",
    notes: "",
  },
  "language-detector": {
    description:
      "Controls access to the language detection functionality of the Translator and Language Detector APIs.",
    defaultAllowlist: "self",
    notes: "",
  },
  "local-fonts": {
    description:
      "Controls access to local font files using a Local Font Access API.",
    defaultAllowlist: "self",
    notes: "Emergent API under review",
  },
  magnetometer: {
    description:
      "Controls access to the Magnetometer sensor interface (magnetic field measurement).",
    defaultAllowlist: "self",
    notes: "Experimental / sensor API",
  },
  microphone: {
    description:
      "Controls whether the document can use the microphone (audio capture via getUserMedia).",
    defaultAllowlist: "self",
    notes: "",
  },
  midi: {
    description: "Controls access to the Web MIDI API.",
    defaultAllowlist: "self",
    notes: "",
  },
  "on-device-speech-recognition": {
    description:
      "Controls access to the on-device speech recognition functionality of the Web Speech API.",
    defaultAllowlist: "self",
    notes: "",
  },
  "otp-credentials": {
    description:
      "Controls whether the current document is allowed to use the WebOTP API to request a one-time password (OTP) from a specially-formatted SMS message.",
    defaultAllowlist: "self",
    notes: "",
  },
  payment: {
    description: "Controls whether the Payment Request API may be invoked.",
    defaultAllowlist: "self",
    notes: "Used for in-browser payments / UI",
  },
  "picture-in-picture": {
    description:
      "Controls whether the document can use Picture-in-Picture video functionality.",
    defaultAllowlist: "*",
    notes: "",
  },
  "publickey-credentials-create": {
    description:
      "Controls whether the current document is allowed to use the Web Authentication API to create new WebAuthn credentials.",
    defaultAllowlist: "self",
    notes: "",
  },
  "publickey-credentials-get": {
    description:
      "Controls requesting WebAuthn / PublicKeyCredential (passwordless / 2FA).",
    defaultAllowlist: "self",
    notes:
      "If disallowed, the navigator.credentials.get({ publicKey: ... }) call will fail",
  },
  "screen-wake-lock": {
    description:
      "Controls whether the current document is allowed to use Screen Wake Lock API to indicate that the device should not dim or turn off the screen.",
    defaultAllowlist: "self",
    notes: "",
  },
  serial: {
    description:
      "Controls whether the current document is allowed to use the Web Serial API to communicate with serial devices.",
    defaultAllowlist: "self",
    notes: "",
  },
  "speaker-selection": {
    description:
      "Controls whether the current document is allowed to enumerate and select audio output devices (speakers, headphones, and so on).",
    defaultAllowlist: "self",
    notes: "",
  },
  "storage-access": {
    description:
      "Controls whether the Storage Access API may be invoked (for frame-level storage partitioning).",
    defaultAllowlist: "*",
    notes:
      "Used to control third-party frame's ability to access cookies / storage.",
  },
  summarizer: {
    description: "Controls access to the Summarizer API.",
    defaultAllowlist: "self",
    notes: "",
  },
  translator: {
    description:
      "Controls access to the translation functionality of the Translator and Language Detector APIs.",
    defaultAllowlist: "self",
    notes: "",
  },
  usb: {
    description:
      "Controls whether the current document is allowed to use the WebUSB API.",
    defaultAllowlist: "self",
    notes: "",
  },
  "web-share": {
    description:
      "Controls whether the Navigator.share() method of the Web Share API is allowed.",
    defaultAllowlist: "self",
    notes: "If disallowed, calls to share() will reject with NotAllowedError.",
  },
  "window-management": {
    description:
      "Controls whether or not the current document is allowed to use the Window Management API to manage windows on multiple displays.",
    defaultAllowlist: "self",
    notes: "",
  },
  "xr-spatial-tracking": {
    description: "Controls access to WebXR / spatial tracking (VR/AR).",
    defaultAllowlist: "self",
    notes: "Experimental WebXR / AR/VR API.",
  },
};

const directives = [];
for (const [key, value] of Object.entries(permissionPolicy)) {
  if (key === "__compat" || key === "wildcards") continue;

  const compat = value?.__compat;
  const bcdStatus = compat?.status || {};

  let status = "";
  if (bcdStatus.deprecated) status = "deprecated";
  else if (bcdStatus.experimental) status = "experimental";
  else if (bcdStatus.standard_track) status = "standard";

  const overlay = directiveOverlay[key] || {};

  directives.push({
    name: key,
    description:
      overlay.description || `Controls the ${key} permission policy directive.`,
    defaultAllowlist: overlay.defaultAllowlist || "self",
    status,
    notes: overlay.notes || "",
  });
}

directives.sort((a, b) => a.name.localeCompare(b.name));

const directivesPath = path.join(outDir, "permission-policy-directives.json");
fs.writeFileSync(directivesPath, JSON.stringify(directives, null, 2));
console.log(
  `  permission-policy-directives.json (${directives.length} directives, ${(Buffer.byteLength(JSON.stringify(directives)) / 1024).toFixed(1)} KB)`,
);

console.log("Done.");
