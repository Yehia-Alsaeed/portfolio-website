import { geolocation, ipAddress, type Request as VercelRequest } from "@vercel/functions";

import type { BrowserClass, DeviceClass, OsClass, RequestFacts } from "./model";

const BOT_TOKENS = [
  "bot",
  "crawler",
  "spider",
  "slurp",
  "facebookexternalhit",
  "preview",
  "headlesschrome",
];

function classifyDevice(userAgent: string): DeviceClass {
  if (!userAgent) return "unknown";
  if (/ipad|tablet|kindle|playbook|nexus (7|9|10)/.test(userAgent)) return "tablet";
  if (/mobi|iphone|ipod|android.*mobile/.test(userAgent)) return "mobile";
  return "desktop";
}

function classifyBrowser(userAgent: string): BrowserClass {
  if (!userAgent) return "unknown";
  if (userAgent.includes("edg/")) return "edge";
  if (userAgent.includes("chrome/") || userAgent.includes("crios/")) return "chrome";
  if (userAgent.includes("firefox/") || userAgent.includes("fxios/")) return "firefox";
  if (userAgent.includes("safari/")) return "safari";
  return "other";
}

function classifyOs(userAgent: string): OsClass {
  if (!userAgent) return "unknown";
  if (userAgent.includes("android")) return "android";
  if (userAgent.includes("iphone") || userAgent.includes("ipad") || userAgent.includes("ipod")) {
    return "ios";
  }
  if (userAgent.includes("mac os x")) return "macos";
  if (userAgent.includes("windows")) return "windows";
  if (userAgent.includes("linux")) return "linux";
  return "other";
}

function isBotUserAgent(userAgent: string): boolean {
  return userAgent.length > 0 && BOT_TOKENS.some((token) => userAgent.includes(token));
}

export function classifyRequest(headers: Headers): RequestFacts {
  const request: VercelRequest = { headers };
  const address = ipAddress(request) ?? "unknown";
  const country = geolocation(request).country ?? "ZZ";
  const userAgent = headers.get("user-agent") ?? "";
  const lowerUserAgent = userAgent.toLowerCase();

  return {
    address,
    userAgent,
    country,
    device: classifyDevice(lowerUserAgent),
    browser: classifyBrowser(lowerUserAgent),
    os: classifyOs(lowerUserAgent),
    isBot: isBotUserAgent(lowerUserAgent),
  };
}
