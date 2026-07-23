import { HttpParams } from '@angular/common/http';

/** Builds HttpParams from a plain object, skipping null/undefined/empty values. */
export function toHttpParams(query: Record<string, unknown> | undefined): HttpParams {
  let params = new HttpParams();
  if (!query) return params;
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === '') continue;
    params = params.set(key, String(value));
  }
  return params;
}
