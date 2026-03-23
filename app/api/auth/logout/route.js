import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST(request) {
  await clearAuthCookie();
  return NextResponse.redirect(new URL("/", request.url));
}
