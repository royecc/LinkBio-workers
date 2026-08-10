import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Many clients only request /favicon.ico — redirect to the SVG icon. */
export function GET(request: Request) {
  return NextResponse.redirect(new URL("/icon", request.url), 302);
}
