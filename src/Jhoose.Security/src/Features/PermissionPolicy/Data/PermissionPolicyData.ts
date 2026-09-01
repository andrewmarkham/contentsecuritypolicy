import { PermissionPolicy } from "../Types/types";
import browserDetailsJson from "./browser-details.json";
import directivesJson from "./permission-policy-directives.json";

export const browserDetails: Record<string, { name: string; logoUrl: string }> =
  browserDetailsJson;
export const PermissionPolicyData: PermissionPolicy[] = directivesJson;
