export interface RowDataType {
  id: string;
  age: number;
  recievedAt: Date;
  type: string;
  url: string;
  user_agent: string;
  browser: string;
  version: string;
  os: string;
  directive: string;
  blockedUri: string;
  body: {
    documentURL: string;
    disposition: string;
    referrer: string;
    effectiveDirective: string;
    blockedURL: string;
    originalPolicy: string;
    statusCode: number;
    sample: string;
    sourceFile: string;
    lineNumber: number;
    columnNumber: number;
  };
}
