import { cookies } from "next/headers";
import { getEnv } from "./env";
import {
  getSessionCookieName,
  verifySessionToken,
} from "./session";

export async function isAdminSession(): Promise<boolean> {
  try {
    const env = await getEnv();
    const jar = await cookies();
    const token = jar.get(getSessionCookieName())?.value;
    return verifySessionToken(token, env.SESSION_SECRET || "");
  } catch {
    return false;
  }
}
