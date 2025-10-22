import type { CookieOptions } from "express";

export function cookieOptionsFromEnv(overrides: Partial<CookieOptions> = {}): CookieOptions {
  const domain = process.env.COOKIE_DOMAIN;
  const base: CookieOptions = {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    ...(domain ? { domain } : {}),
  } as CookieOptions;

  return { ...base, ...overrides } as CookieOptions;
}

export default cookieOptionsFromEnv;
