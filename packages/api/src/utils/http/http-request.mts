export class HttpRequest {
  async post<T extends object>(url: string | URL, body?: T, options?: RequestInit): Promise<Response> {
    const response = await fetch(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    return response;
  }
}
