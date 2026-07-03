// Recipe time badges read as raw minutes ("220m") past about an hour and a
// half, which nobody parses at a glance -- switch to hours+minutes once the
// total crosses 90 (spec: "220m" -> "3h 40m").
export function formatMinutes(totalMinutes) {
  if (totalMinutes == null) return '';
  if (totalMinutes < 90) return `${totalMinutes}m`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}
