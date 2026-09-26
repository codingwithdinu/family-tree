import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const language = String(form.get("language") ?? "hi");
  if (!name || name.length > 120 || !["hi", "en"].includes(language)) {
    return NextResponse.redirect(new URL("/app/tree?error=invalid-family", request.url), 303);
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login?next=/app/tree", request.url), 303);
  const { error } = await supabase.rpc("bootstrap_family", { p_name: name, p_language: language });
  if (error) return NextResponse.redirect(new URL("/app/tree?error=family-create-failed", request.url), 303);
  return NextResponse.redirect(new URL("/app/tree", request.url), 303);
}
