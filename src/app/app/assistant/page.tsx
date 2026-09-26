import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FamilyAIChat } from "./family-ai-chat";

export default async function FamilyAIPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app/assistant");
  const { data: memberships } = await supabase.from("family_memberships").select("family_id, families(id,name,default_language)").eq("user_id",user.id).eq("status","active");
  const family = memberships?.[0]?.families as unknown as {id:string;name:string;default_language:string}|null;
  if (!family) return <main className="min-h-screen bg-[#f8f7f2] p-6 text-[#24372d]"><div className="mx-auto max-w-xl rounded-3xl bg-white p-8"><h1 className="text-2xl font-semibold">Create your family first</h1><p className="mt-3 text-[#68746a]">Family AI needs a family workspace and its relationships to answer accurately.</p><Link href="/app/tree" className="mt-6 inline-block rounded-full bg-[#244b38] px-5 py-3 font-semibold text-white">Open family tree</Link></div></main>;
  const {data:people}=await supabase.from("persons").select("id,display_name,native_name,gender,birth_date").eq("family_id",family.id).order("created_at");
  return <FamilyAIChat familyId={family.id} familyName={family.name} defaultLanguage={family.default_language} people={people??[]}/>;
}
