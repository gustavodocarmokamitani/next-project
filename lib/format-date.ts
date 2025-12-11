export function formatDate(date: Date | string | null | undefined): string {
  if (!date) {
    return ""
  }

  if (typeof date === "string") {
    return date
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

