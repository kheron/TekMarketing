import { NextResponse } from "next/server";
import { getPublicTekheroConfig } from "@/lib/config/tekhero";

export async function GET() {
  return NextResponse.json(getPublicTekheroConfig());
}