import { GUEST_ALLOWED_PREFIXES } from "@/constants/guest.routes";

export const isGuestAllowedRoute = (url: string) => {
  console.log({ guest_route: url });
  return GUEST_ALLOWED_PREFIXES.some((prefix) => url.startsWith(prefix));
};
