
var options = {
    "Cross-Origin-Embedder-Policy": [
        { label: "UnSafeNone", value: 0 },
        { label: "RequireCorp", value: 1 }
    ],

    "Cross-Origin-Opener-Policy": [
        { label: "UnSafeNone", value: 0 },
        { label: "SameOriginAllowPopups", value: 1 },
        { label: "SameOrigin", value: 2 }
    ],

    "Cross-Origin-Resource-Policy": [
        { label: "SameSite", value: 0 },
        { label: "SameOrigin", value: 1 },
        { label: "CrossOrigin", value: 2 }
    ],

    "Referrer-Policy": [
        { label: "NoReferrer", value: 0 },
        { label: "NoReferrerWhenDownGrade", value: 1 },
        { label: "Origin", value: 2 },
        { label: "OriginWhenCrossOrigin", value: 3 },
        { label: "SameOrigin", value: 4 },
        { label: "StrictOrigin", value: 5 },
        { label: "StrictOriginWhenCrossOrigin", value: 6 },
        { label: "UnsafeUrl", value: 7 }
    ],

    "X-Frame-Options": [
        { label: "Deny", value: 0 },
        { label: "SameOrigin", value: 1 },
        { label: "AllowFrom", value: 2 }
    ],

    "X-Permitted-Cross-Domain-Policies": [
        { label: "None", value: 0 },
        { label: "MasterOnly", value: 1 },
        { label: "ByContentType", value: 2 },
        { label: "All", value: 3 }
    ]
    
}

export function getHeaderOptions(header) {

    return options[header];s
}

export function getLabelForHeaderOption(header, mode) {

    var options = getHeaderOptions(header);
    var option = options.find((o) => o.value === mode);

    return option.label;
}

export default { getHeaderOptions, getLabelForHeaderOption }