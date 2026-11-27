/**
 * Helper para inyectar credenciales de anfitrión en peticiones frontend
 * para garantizar aislamiento multi-tenant estricto en DynamoDB.
 */
export function getClientTenantHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const headers: Record<string, string> = {};
  const tenant =
    localStorage.getItem("aurea_tenant_account") ||
    localStorage.getItem("aurea_tenant_id");
  const pin = localStorage.getItem("aurea_access_pin");

  if (tenant) headers["x-tenant-id"] = tenant;
  if (pin) headers["x-tenant-pin"] = pin;
  return headers;
}
