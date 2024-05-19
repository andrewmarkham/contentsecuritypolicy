import { SelectOption } from "@episerver/ui-framework";

type HeaderOption = {
    key: string;
    options: SelectOption[];
}

type HeaderOptionll = {
    label: string;
    value: number;
}

var options: HeaderOption[] = [
    { 
        key: "Cross-Origin-Embedder-Policy", options: [
        { label: "UnSafeNone", value: "0" },
        { label: "RequireCorp", value: "1" }
    ]},

    { 
        key: "Cross-Origin-Opener-Policy", options: [
        { label: "UnSafeNone", value: "0" },
        { label: "SameOriginAllowPopups", value: "1" },
        { label: "SameOrigin", value: "2" }
    ]},

    { 
        key: "Cross-Origin-Resource-Policy", options: [
        { label: "SameSite", value: "0" },
        { label: "SameOrigin", value: "1" },
        { label: "CrossOrigin", value: "2" }
    ]},

    { 
        key: "Referrer-Policy", options: [
        { label: "NoReferrer", value: "0" },
        { label: "NoReferrerWhenDownGrade", value: "1" },
        { label: "Origin", value: "2" },
        { label: "OriginWhenCrossOrigin", value: "3" },
        { label: "SameOrigin", value: "4" },
        { label: "StrictOrigin", value: "5" },
        { label: "StrictOriginWhenCrossOrigin", value: "6" },
        { label: "UnsafeUrl", value: "7" }
    ]},

    { 
        key: "X-Frame-Options", options: [
        { label: "Deny", value: "0" },
        { label: "SameOrigin", value: "1" },
        { label: "AllowFrom", value: "2" }
    ]},

    { 
        key: "X-Permitted-Cross-Domain-Policies", options: [
        { label: "None", value: "0" },
        { label: "MasterOnly", value: "1" },
        { label: "ByContentType", value: "2" },
        { label: "All", value: "3" }
    ]}
    
]

export function getHeaderOptions(header: string): SelectOption[] {

    return options.find((o: HeaderOption) => o.key === header)?.options ?? [];
}

export function getLabelForHeaderOption(header: string, mode?: number) :string {

    var options = getHeaderOptions(header);
    var option = options.find((o: SelectOption) => parseInt(o.value) === mode);

    return option?.label ?? "";
}

export default { getHeaderOptions, getLabelForHeaderOption }