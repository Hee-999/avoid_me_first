export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "1405598142647727";

export function trackMetaEvent(
  eventName: string,
  params?: Record<string, unknown>,
  eventId?: string
) {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq !== "function") return;

  if (eventId) {
    fbq("track", eventName, params || {}, { eventID: eventId });
  } else if (params) {
    fbq("track", eventName, params);
  } else {
    fbq("track", eventName);
  }
}
