import { PermissionPolicy } from "../types";

export const browserDetails: Record<string, { name: string; logoUrl: string }> = {
    chrome: { name: 'Chrome', logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome_48x48.png' },
    firefox: { name: 'Firefox', logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/main/src/firefox/firefox_48x48.png' },
    safari: { name: 'Safari', logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/main/src/safari/safari_48x48.png' },
    edge: { name: 'Edge', logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/main/src/edge/edge_48x48.png' },
    opera: { name: 'Opera', logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/main/src/opera/opera_48x48.png' },
    ie: { name: 'Internet Explorer', logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/main/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png' },
    firefox_android: { name: 'Firefox Android', logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/main/src/firefox/firefox_48x48.png' },
    chrome_android: { name: 'Chrome Android', logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome_48x48.png' },
    edge_android: { name: 'Edge Android', logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/main/src/edge/edge_48x48.png' },
    samsunginternet_android: { name: 'Samsung Internet', logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/main/src/samsung-internet/samsung-internet_48x48.png' },
    opera_android: { name: 'Opera Android', logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/main/src/opera/opera_48x48.png' },
    webview_android: { name: 'WebView Android', logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/main/src/android-webview/android-webview_48x48.png' },
    oculus: { name: 'Oculus', logoUrl: 'data:image/png;base64,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' },
    webview_ios: { name: 'WebView iOS', logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/main/src/safari/safari_48x48.png' },
    safari_ios: { name: 'Safari iOS', logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/main/src/safari/safari_48x48.png' }
};


export const PermissionPolicyData: PermissionPolicy[] = [
    {
        name: 'accelerometer',
        description:
            'Controls whether the document can access the Accelerometer interface to read device acceleration.',
        defaultAllowlist: 'self',
        status: 'provisional',
        notes: 'Experimental / not widely implemented',
    },
    {
        name: 'ambient-light-sensor',
        description: 'Controls access to the AmbientLightSensor API to measure ambient light levels.',
        defaultAllowlist: 'self',
        status: 'provisional',
        notes: 'Experimental / not widely implemented',
    },
    {
        name: 'autoplay',
        description:
            'Controls whether video / audio elements in the page (or embedded frames) can start playing automatically without user interaction.',
        defaultAllowlist: '*',
        status: 'standard',
        notes: 'Used in many browsers already',
    },
    {
        name: 'attribution-reporting',
        description: 'Allows use of the Attribution Reporting API (privacy-sandbox / ad measurement).',
        defaultAllowlist: '*',
        status: 'experimental',
        notes: 'Under development in Chromium / related to ad-tech proposals',
    },
    {
        name: 'browsing-topics',
        description:
            'Controls access to the Topics API (interest cohort / user topics) for personalization / advertising.',
        defaultAllowlist: '*',
        status: 'experimental',
        notes: 'Privacy-sandbox API; not implemented in all browsers',
    },
    {
        name: 'camera',
        description: 'Controls whether the document can use the camera (e.g. via getUserMedia).',
        defaultAllowlist: 'self',
        status: 'standard',
        notes: 'A powerful feature; will require user permission if allowed',
    },
    {
        name: 'display-capture',
        description: 'Controls ability to capture the screen or display (e.g. using getDisplayMedia).',
        defaultAllowlist: 'self',
        status: 'standard',
        notes: 'Often grouped under "screen capture" in browser feature sets',
    },
    {
        name: 'encrypted-media',
        description: 'Controls whether Encrypted Media Extensions (EME) can be used (for DRM playback).',
        defaultAllowlist: '*',
        status: 'standard',
        notes: 'Media DRM APIs',
    },
    {
        name: 'fullscreen',
        description: 'Controls whether the document can use the Fullscreen API.',
        defaultAllowlist: '*',
        status: 'standard',
        notes: '',
    },
    {
        name: 'geolocation',
        description: 'Controls whether the document can request geolocation (via the Geolocation API).',
        defaultAllowlist: 'self',
        status: 'standard',
        notes: 'If blocked, calls to getCurrentPosition / watchPosition will error with PERMISSION_DENIED.',
    },
    {
        name: 'gyroscope',
        description: 'Controls access to the Gyroscope sensor interface (rotation rate).',
        defaultAllowlist: 'self',
        status: 'provisional',
        notes: 'Experimental / sensor API',
    },
    {
        name: 'magnetometer',
        description: 'Controls access to the Magnetometer sensor interface (magnetic field measurement).',
        defaultAllowlist: 'self',
        status: 'provisional',
        notes: 'Experimental / sensor API',
    },
    {
        name: 'identity-credentials-get',
        description:
            'Controls whether the document can request federated credentials or identity credential objects.',
        defaultAllowlist: 'self',
        status: 'experimental',
        notes: 'Under development for federated login / identity APIs',
    },
    {
        name: 'local-fonts',
        description: 'Controls access to local font files using a Local Font Access API.',
        defaultAllowlist: 'self',
        status: 'experimental',
        notes: 'Emergent API under review',
    },
    {
        name: 'microphone',
        description: 'Controls whether the document can use the microphone (audio capture via getUserMedia).',
        defaultAllowlist: 'self',
        status: 'standard',
        notes: '',
    },
    {
        name: 'midi',
        description: 'Controls access to the Web MIDI API.',
        defaultAllowlist: 'self',
        status: 'standard',
        notes: '',
    },
    {
        name: 'payment',
        description: 'Controls whether the Payment Request API may be invoked.',
        defaultAllowlist: 'self',
        status: 'standard',
        notes: 'Used for in-browser payments / UI',
    },
    {
        name: 'picture-in-picture',
        description: 'Controls whether the document can use Picture-in-Picture video functionality.',
        defaultAllowlist: '*',
        status: 'standard',
        notes: '',
    },
    {
        name: 'publickey-credentials-get',
        description: 'Controls requesting WebAuthn / PublicKeyCredential (passwordless / 2FA).',
        defaultAllowlist: 'self',
        status: 'standard',
        notes: 'If disallowed, the `navigator.credentials.get({ publicKey: ... })` call will fail',
    },
    {
        name: 'storage-access',
        description:
            'Controls whether the Storage Access API may be invoked (for frame-level storage partitioning).',
        defaultAllowlist: '*',
        status: 'standard',
        notes: "Used to control third-party frame's ability to access cookies / storage.",
    },
    {
        name: 'web-share',
        description: 'Controls whether the `Navigator.share()` method of the Web Share API is allowed.',
        defaultAllowlist: 'self',
        status: 'standard',
        notes: 'If disallowed, calls to share() will reject with NotAllowedError.',
    },
    {
        name: 'xr-spatial-tracking',
        description: 'Controls access to WebXR / spatial tracking (VR/AR).',
        defaultAllowlist: 'self',
        status: 'experimental',
        notes:
            'Experimental WebXR / AR/VR API. MDN lists it under `xr-spatial-tracking` in Permissions-Policy header directives.',
    },




    {
        name: 'aria-notify',
        description: 'Controls whether the current document is allowed to use the ariaNotify() method to fire screen reader announcements.',
        defaultAllowlist: 'self',
        status: '',
        notes: '',
    },
    {
        name: 'bluetooth',
        description: 'The HTTP Permissions-Policy header bluetooth directive controls whether the current document is allowed to use the Web Bluetooth API.',
        defaultAllowlist: 'self',
        status: '',
        notes: '',
    },
    {
        name: 'captured-surface-control',
        description: 'The HTTP Permissions-Policy header captured-surface-control directive controls whether or not the document is permitted to use the Captured Surface Control API. Specifically, the forwardWheel(), increaseZoomLevel(), decreaseZoomLevel(), and resetZoomLevel() methods are controlled by this directive.',
        defaultAllowlist: 'self',
        status: '',
        notes: '',
    },
    {
        name: 'compute-pressure',
        description: 'The HTTP Permissions-Policy header compute-pressure directive controls access to the Compute Pressure API.',
        defaultAllowlist: 'self',
        status: '',
        notes: '',
    },
    {
        name: 'cross-origin-isolated',
        description: 'The HTTP Permissions-Policy header cross-origin-isolated directive controls whether the current document is allowed to use APIs that require cross-origin isolation.',
        defaultAllowlist: 'self',
        status: '',
        notes: '',
    },
    {
        name: 'deferred-fetch',
        description: 'The deferred-fetch Permissions-Policy directive is part of the fetchLater() API.',
        defaultAllowlist: 'self',
        status: '',
        notes: '',
    },
    {
        name: 'deferred-fetch-minimal',
        description: 'The deferred-fetch-minimal Permissions-Policy directive is part of the fetchLater() API.',
        defaultAllowlist: '*',
        status: '',
        notes: '',
    },
    {
        name: 'gamepad',
        description: 'The HTTP Permissions-Policy header gamepad directive controls whether the current document is allowed to use the Gamepad API.',
        defaultAllowlist: 'self',
        status: '',
        notes: '',
    },
    {
        name: 'hid',
        description: 'The HTTP Permissions-Policy header hid directive controls whether the current document is allowed to use the WebHID API to connect to uncommon or exotic human interface devices such as alternative keyboards or gamepads.',
        defaultAllowlist: 'self',
        status: '',
        notes: '',
    },
    {
        name: 'idle-detection',
        description: 'The HTTP Permissions-Policy header idle-detection directive controls whether the current document is allowed to use the Idle Detection API to detect when users are interacting with their devices, for example to report "available"/"away" status in chat applications.',
        defaultAllowlist: 'self',
        status: '',
        notes: '',
    },
    {
        name: 'language-detector',
        description: 'The HTTP Permissions-Policy header language-detector directive controls access to the language detection functionality of the Translator and Language Detector APIs.',
        defaultAllowlist: 'self',
        status: '',
        notes: '',
    },
    {
        name: 'on-device-speech-recognition',
        description: 'The HTTP Permissions-Policy header on-device-speech-recognition directive controls access to the on-device speech recognition functionality of the Web Speech API.',
        defaultAllowlist: 'self',
        status: '',
        notes: '',
    },
    {
        name: 'otp-credentials',
        description: 'The HTTP Permissions-Policy header otp-credentials directive controls whether the current document is allowed to use the WebOTP API to request a one-time password (OTP) from a specially-formatted SMS message sent by the app\'s server, i.e., via navigator.credentials.get({otp: ..., ...}).',
        defaultAllowlist: 'self',
        status: '',
        notes: '',
    },
    {
        name: 'publickey-credentials-create',
        description: 'The HTTP Permissions-Policy header publickey-credentials-create directive controls whether the current document is allowed to use the Web Authentication API to create new WebAuthn credentials, i.e., via navigator.credentials.create({publicKey}).',
        defaultAllowlist: 'self',
        status: '',
        notes: '',
    },
    {
        name: 'screen-wake-lock',
        description: 'The HTTP Permissions-Policy header screen-wake-lock directive controls whether the current document is allowed to use Screen Wake Lock API to indicate that the device should not dim or turn off the screen.',
        defaultAllowlist: 'self',
        status: '',
        notes: '',
    },
    {
        name: 'serial',
        description: 'The HTTP Permissions-Policy header serial directive controls whether the current document is allowed to use the Web Serial API to communicate with serial devices, either directly connected via a serial port, or via USB or Bluetooth devices emulating a serial port.',
        defaultAllowlist: 'self',
        status: '',
        notes: '',
    },
    {
        name: 'speaker-selection',
        description: 'The HTTP Permissions-Policy header speaker-selection directive controls whether the current document is allowed to enumerate and select audio output devices (speakers, headphones, and so on).',
        defaultAllowlist: 'self',
        status: '',
        notes: '',
    },
    {
        name: 'translator',
        description: 'The HTTP Permissions-Policy header translator directive controls access to the translation functionality of the Translator and Language Detector APIs.',
        defaultAllowlist: 'self',
        status: '',
        notes: '',
    },
    {
        name: 'summarizer',
        description: 'The HTTP Permissions-Policy header summarizer directive controls access to the Summarizer API.',
        defaultAllowlist: 'self',
        status: '',
        notes: '',
    },
    {
        name: 'usb',
        description: 'The HTTP Permissions-Policy header usb directive controls whether the current document is allowed to use the WebUSB API.',
        defaultAllowlist: 'self',
        status: '',
        notes: '',
    },
    {
        name: 'window-management',
        description: 'The HTTP Permissions-Policy header window-management directive controls whether or not the current document is allowed to use the Window Management API to manage windows on multiple displays.',
        defaultAllowlist: 'self',
        status: '',
        notes: '',
    }
];








