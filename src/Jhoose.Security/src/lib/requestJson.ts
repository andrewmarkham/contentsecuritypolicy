type RequestOptions = {
  method?: string;
  body?: string;
};

export async function requestJson<T>(url: string, options?: RequestOptions): Promise<T> {
  const response = await fetch(url, {
    method: options?.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options?.body,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unexpected error';
}
