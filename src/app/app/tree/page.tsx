import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TreeWorkspace } from "./tree-workspace";

export default async function FamilyTreePage() {
  let supabase;
  try { supabase = await createClient(); } catch { return <SetupNotice />; }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app/tree");
  const { data: memberships } = await supabase.from("family_memberships").select("family_id, role, families(id,name,default_language)").eq("user_id", user.id).eq("status", "active");
  const family = memberships?.[0]?.families as unknown as { id: string; name: string; default_language: string } | null;
  if (!family) return <main className="min-h-screen bg-[#f8f7f2] px-6 py-16 text-[#24372d]"><div className="mx-auto max-w-xl rounded-3xl border border-[#e5e8df] bg-white p-8"><p className="text-xs font-semibold uppercase tracking-widest text-[#7a8d70]">Welcome to Vansh</p><h1 className="mt-3 text-3xl font-semibold">Start your family story</h1><p className="mt-3 text-[#6b766b]">Create your private family workspace to start adding generations. The workspace will be saved to your Supabase account.</p><CreateFamilyForm /></div></main>;
  const [{ data: people }, { data: relationships }] = await Promise.all([
    supabase.from("persons").select("id,display_name,native_name,gender,birth_date,biography,avatar_path").eq("family_id", family.id).order("created_at"),
    supabase.from("relationships").select("id,from_person_id,to_person_id,relationship_type,parent_role").eq("family_id", family.id),
  ]);
  return <TreeWorkspace family={family} initialPeople={people ?? []} initialRelationships={relationships ?? []} role={(memberships?.[0]?.role as string) ?? "viewer"} />;
}

function CreateFamilyForm() {
  return <form action="/app/tree/create-family" method="post" className="mt-7 space-y-4"><label className="block text-sm font-medium">Family name<input name="name" required minLength={1} maxLength={120} placeholder="e.g. Patel Family" className="mt-2 w-full rounded-xl border border-[#dfe4da] bg-[#fcfcf9] px-4 py-3 outline-none focus:border-[#78916c]" /></label><label className="block text-sm font-medium">Default language<select name="language" className="mt-2 w-full rounded-xl border border-[#dfe4da] bg-[#fcfcf9] px-4 py-3"><option value="hi">हिंदी</option><option value="en">English</option></select></label><button className="w-full rounded-full bg-[#244b38] px-6 py-3 font-semibold text-white hover:bg-[#183727]">Create private family</button></form>;
}

function SetupNotice() { return <main className="min-h-screen bg-[#f8f7f2] p-8"><div className="mx-auto max-w-xl rounded-3xl bg-white p-8"><h1 className="text-2xl font-semibold">Connect Supabase to continue</h1><p className="mt-3 text-[#68746a]">Add your Supabase project URL and anon key to the Vercel environment variables or local .env.local file, then apply the SQL migration in supabase/migrations.</p><Link className="mt-6 inline-block text-[#416246] underline" href="https://supabase.com/dashboard">Open Supabase dashboard</Link></div></main>; }
