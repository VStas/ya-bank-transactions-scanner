// Helper to format Date as m/d/yyyy
function formatToMDYYYY(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

export function parseCustomDate(dateStr: string) {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Month names (Russian) -> numeric value
  const months = {
    января: 1,
    февраля: 2,
    марта: 3,
    апреля: 4,
    мая: 5,
    июня: 6,
    июля: 7,
    августа: 8,
    сентября: 9,
    октября: 10,
    ноября: 11,
    декабря: 12,
  };

  // Handle special cases
  if (dateStr === "Сегодня") {
    return formatToMDYYYY(now);
  }

  if (dateStr === "Вчера") {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return formatToMDYYYY(yesterday);
  }

  // Parse strings like "8 January" or "8 January 2024"
  const parts = dateStr.split(" ");
  if (parts.length >= 2) {
    const day = parseInt(parts[0], 10);
    const monthKey = parts[1];
    const month = monthKey ? months[monthKey as keyof typeof months] : undefined;
    let year = currentYear;

    // If year is specified (e.g. "8 January 2024")
    if (parts.length === 3) {
      year = parseInt(parts[2], 10);
    }

    if (month === undefined) {
      return formatToMDYYYY(now);
    }
    return `${month}/${day}/${year}`;
  }

  // If format is not recognized, return null
  return null;
}
