export type SecurityHeader = {
    name: string,
    maxAge?: number,
    includeSubDomains?: boolean,
    mode?: number,
    domain?: string,
    value?: string,
    id: string,
    enabled: boolean
  }