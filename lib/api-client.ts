type JsonRecord = Record<string, unknown>

export async function postJson<T = unknown>(url: string, body: JsonRecord) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const message =
      (data as { error?: string }).error ?? "Erro na requisição"
    throw new Error(message)
  }

  return res.json() as Promise<T>
}

