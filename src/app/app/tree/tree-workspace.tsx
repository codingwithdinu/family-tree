"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { createClient } from "@/lib/supabase/client";

type Person = { id: string; display_name: string; native_name: string | null; gender: string | null; birth_date: string | null; biography: string | null };
type Relationship = { id: string; from_person_id: string; to_person_id: string; relationship_type: string; parent_role: string | null };
type Family = { id: string; name: string; default_language: string };

export function TreeWorkspace({ family, initialPeople, initialRelationships, role }: { family: Family; initialPeople: Person[]; initialRelationships: Relationship[]; role: string }) {
  const [people, setPeople] = useState(initialPeople);
  const [relationships, setRelationships] = useState(initialRelationships);
  const [selected, setSelected] = useState<Person | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const canEdit = role === "owner" || role === "editor";
  const graph = useMemo(() => buildGraph(people, relationships), [people, relationships]);

  async function addPerson(formData: FormData) {
    setBusy(true); setError("");
    const name = String(formData.get("display_name") ?? "").trim();
    const nativeName = String(formData.get("native_name") ?? "").trim() || null;
    const gender = String(formData.get("gender") ?? "unspecified");
    const parentId = String(formData.get("parent_id") ?? "");
    if (!name) { setError("Please enter a name."); setBusy(false); return; }
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in again.");
      const { data: person, error: insertError } = await supabase.from("persons").insert({ family_id: family.id, display_name: name, native_name: nativeName, gender, created_by: user.id }).select("id,display_name,native_name,gender,birth_date,biography").single();
      if (insertError) throw insertError;
      let rel: Relationship | null = null;
      if (parentId) {
        const { data, error: relError } = await supabase.from("relationships").insert({ family_id: family.id, from_person_id: parentId, to_person_id: person.id, relationship_type: "parent_child", parent_role: "biological", created_by: user.id }).select("id,from_person_id,to_person_id,relationship_type,parent_role").single();
        if (relError) {
          await supabase.from("persons").delete().eq("id", person.id).eq("family_id", family.id);
          throw relError;
        }
        rel = data;
      }
      setPeople(old => [...old, person]);
      if (rel) setRelationships(old => [...old, rel!]);
      setShowAdd(false);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save this person."); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#f8f7f2] text-[#24372d]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e7e9e0] bg-[#fffefa] px-5 py-4 sm:px-8">
      <div className="flex items-center gap-3"><Link href="/" className="grid h-10 w-10 place-items-center rounded-2xl bg-[#244b38] font-semibold text-white">V</Link><div><p className="text-xs text-[#879184]">Your private family</p><h1 className="font-semibold">{family.name}</h1></div><span className="rounded-full bg-[#edf2e8] px-3 py-1 text-xs text-[#52714f]">Private</span></div>
      <div className="flex gap-2"><Link href="/app/assistant" className="rounded-full border border-[#dce2d7] px-4 py-2.5 text-sm">Family AI</Link>{canEdit && <button onClick={() => {setShowAdd(true);setError("");}} className="rounded-full bg-[#244b38] px-5 py-2.5 text-sm font-semibold text-white">+ Add member</button>}</div>
    </header>
    <div className="grid min-h-[calc(100vh-73px)] lg:grid-cols-[1fr_310px]">
      <section className="relative min-h-[70vh] border-b border-[#e7e9e0] lg:border-b-0 lg:border-r">
        <div className="absolute left-5 top-5 z-10 rounded-2xl border border-[#e6e9e0] bg-white/95 px-4 py-3 shadow-sm"><p className="text-xs text-[#879184]">Family members</p><p className="text-xl font-semibold">{people.length}</p></div>
        {people.length === 0 ? <div className="absolute inset-0 grid place-items-center p-6"><div className="max-w-sm text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#e9efe3] text-3xl text-[#54734f]">♧</div><h2 className="mt-5 text-2xl font-semibold">Your family story starts here</h2><p className="mt-3 text-sm leading-6 text-[#768073]">Add yourself or a family member. Then connect parents, spouses and children to grow your tree.</p>{canEdit && <button onClick={() => setShowAdd(true)} className="mt-6 rounded-full bg-[#244b38] px-6 py-3 text-sm font-semibold text-white">Add your first member</button>}</div></div> : <ReactFlow nodes={graph.nodes} edges={graph.edges} fitView fitViewOptions={{padding:.2}} onNodeClick={(_, node) => setSelected(people.find(p => p.id === node.id) ?? null)} nodesConnectable={false} elementsSelectable proOptions={{hideAttribution:true}}><Background color="#dfe4da" gap={22}/><Controls/><MiniMap pannable zoomable nodeColor="#b9cdb0"/></ReactFlow>}
      </section>
      <aside className="bg-[#fffefa] p-5 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#8b9685]">Family workspace</p><h2 className="mt-2 text-xl font-semibold">Your people</h2><p className="mt-2 text-sm leading-6 text-[#788174]">Select a member in the tree to see their profile. Your data is stored in your private workspace.</p><div className="mt-6 space-y-2">{people.map(p=><button key={p.id} onClick={()=>setSelected(p)} className="flex w-full items-center gap-3 rounded-2xl border border-[#edf0e8] p-3 text-left hover:bg-[#f8f9f5]"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#f1e9db] font-serif text-lg text-[#876d4e]">{(p.native_name||p.display_name).slice(0,1)}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{p.native_name||p.display_name}</span><span className="block text-xs text-[#92998e]">{p.gender && p.gender!=="unspecified" ? p.gender : "Family member"}</span></span></button>)}</div>
        {selected && <div className="mt-6 rounded-2xl bg-[#f4f5ef] p-4"><p className="text-xs text-[#879184]">Selected profile</p><h3 className="mt-1 text-lg font-semibold">{selected.display_name}</h3>{selected.native_name && <p className="text-sm text-[#6e796b]">{selected.native_name}</p>}{selected.birth_date && <p className="mt-2 text-sm text-[#6e796b]">Born {selected.birth_date}</p>}{selected.biography && <p className="mt-3 text-sm leading-6 text-[#6e796b]">{selected.biography}</p>}<button onClick={()=>setSelected(null)} className="mt-3 text-xs text-[#54734f] underline">Close profile</button></div>}
      </aside>
    </div>
    {showAdd && <div className="fixed inset-0 z-50 grid place-items-center bg-[#18251d]/40 p-4" role="dialog" aria-modal="true"><form action={addPerson} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-[#fffefa] p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-[#879184]">Grow your family</p><h2 className="mt-2 text-2xl font-semibold">Add a member</h2></div><button type="button" onClick={()=>setShowAdd(false)} aria-label="Close" className="rounded-full border px-3 py-1.5">×</button></div>
      <label className="mt-6 block text-sm font-medium">Full name *<input name="display_name" required maxLength={160} placeholder="Enter full name" className="mt-2 w-full rounded-xl border border-[#dfe4da] bg-white px-4 py-3 outline-none focus:border-[#78916c]"/></label>
      <label className="mt-4 block text-sm font-medium">Name in Hindi / native script<input name="native_name" maxLength={160} placeholder="नाम (वैकल्पिक)" className="mt-2 w-full rounded-xl border border-[#dfe4da] bg-white px-4 py-3 outline-none focus:border-[#78916c]"/></label>
      <label className="mt-4 block text-sm font-medium">Gender (optional)<select name="gender" className="mt-2 w-full rounded-xl border border-[#dfe4da] bg-white px-4 py-3"><option value="unspecified">Prefer not to specify</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label>
      <label className="mt-4 block text-sm font-medium">Child of (optional)<select name="parent_id" className="mt-2 w-full rounded-xl border border-[#dfe4da] bg-white px-4 py-3"><option value="">No parent connection yet</option>{people.map(p=><option key={p.id} value={p.id}>{p.native_name||p.display_name}</option>)}</select><span className="mt-1 block text-xs font-normal text-[#8a9385]">Creates a parent → child link. More relationship types will be added next.</span></label>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={busy} className="mt-6 w-full rounded-full bg-[#244b38] px-6 py-3.5 font-semibold text-white disabled:opacity-60">{busy?"Saving...":"Save family member"}</button></form></div>}
  </main>;
}

function buildGraph(people: Person[], relationships: Relationship[]): {nodes: Node[]; edges: Edge[]} {
  const valid = new Set(people.map(p=>p.id));
  const parents = new Map<string,string[]>(); const children = new Map<string,string[]>();
  for(const r of relationships.filter(r=>r.relationship_type==="parent_child"&&valid.has(r.from_person_id)&&valid.has(r.to_person_id))){parents.set(r.to_person_id,[...(parents.get(r.to_person_id)??[]),r.from_person_id]);children.set(r.from_person_id,[...(children.get(r.from_person_id)??[]),r.to_person_id]);}
  const depth = new Map<string,number>(); const queue = people.filter(p=>(parents.get(p.id)??[]).length===0).map(p=>({id:p.id,d:0}));
  while(queue.length){const item=queue.shift()!;if(depth.has(item.id))continue;depth.set(item.id,item.d);for(const child of children.get(item.id)??[])queue.push({id:child,d:item.d+1});}
  for(const p of people)if(!depth.has(p.id))depth.set(p.id,0);
  const groups=new Map<number,Person[]>();for(const p of people){const d=depth.get(p.id)??0;groups.set(d,[...(groups.get(d)??[]),p]);}
  const nodes:Node[]=people.map(p=>{const d=depth.get(p.id)??0;const row=groups.get(d)??[];const i=row.findIndex(x=>x.id===p.id);return {id:p.id,position:{x:i*230-(row.length-1)*115,y:d*170},data:{label:<div className="min-w-[155px] rounded-2xl border border-[#e0e6da] bg-[#fffefa] px-4 py-3 text-center shadow-md"><div className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-full bg-[#edf2e8] font-serif text-lg text-[#54734f]">{(p.native_name||p.display_name).slice(0,1)}</div><div className="max-w-[170px] truncate text-sm font-semibold text-[#2b4031]">{p.native_name||p.display_name}</div><div className="mt-1 text-[10px] text-[#8b9685]">{d===0?"Starting generation":"Generation "+(d+1)}</div></div>},type:"default"};});
  const edges:Edge[]=relationships.filter(r=>valid.has(r.from_person_id)&&valid.has(r.to_person_id)).map(r=>({id:r.id,source:r.from_person_id,target:r.to_person_id,type:"smoothstep",style:{stroke:"#9bad92",strokeWidth:1.7}}));
  return {nodes,edges};
}
