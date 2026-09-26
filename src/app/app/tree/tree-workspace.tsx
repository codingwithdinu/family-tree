"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Background, Controls, MiniMap, ReactFlow, useNodesState, type Edge, type Node } from "@xyflow/react";
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
  const [addRelation, setAddRelation] = useState<"none" | "parent" | "child" | "spouse" | "partner">("none");
  const [showEdit, setShowEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const canEdit = role === "owner" || role === "editor";
  const graph = useMemo(() => buildGraph(people, relationships, (personId, relation) => { const person = people.find(p => p.id === personId); if (person) { setSelected(person); setAddRelation(relation); setShowAdd(true); setError(""); } }), [people, relationships]);
  const [diagramNodes, setDiagramNodes, onNodesChange] = useNodesState(graph.nodes);
  useEffect(() => { setDiagramNodes(current => { const previous = new Map(current.map(n => [n.id, n.position])); return graph.nodes.map(n => ({...n, position: previous.get(n.id) ?? n.position})); }); }, [graph.nodes, setDiagramNodes]);

  async function addPerson(formData: FormData) {
    setBusy(true); setError("");
    const name = String(formData.get("display_name") ?? "").trim();
    const nativeName = String(formData.get("native_name") ?? "").trim() || null;
    const gender = String(formData.get("gender") ?? "unspecified");
    const relatedPersonId = String(formData.get("related_person_id") ?? "");
    const relation = String(formData.get("relation") ?? "none");
    const parentRole = String(formData.get("parent_role") ?? "biological");
    if (!name) { setError("Please enter a name."); setBusy(false); return; }
    if (relation !== "none" && (!relatedPersonId || !people.some(p => p.id === relatedPersonId))) {
      setError("Please choose which family member this person is related to."); setBusy(false); return;
    }
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in again.");
      const { data: person, error: insertError } = await supabase.from("persons").insert({ family_id: family.id, display_name: name, native_name: nativeName, gender, created_by: user.id }).select("id,display_name,native_name,gender,birth_date,biography").single();
      if (insertError) throw insertError;
      let rel: Relationship | null = null;
      if (relation !== "none") {
        const isParent = relation === "parent";
        const isChild = relation === "child";
        const relationshipType = relation === "spouse" ? "spouse" : relation === "partner" ? "partner" : "parent_child";
        const fromId = isParent ? person.id : relatedPersonId;
        const toId = isParent ? relatedPersonId : person.id;
        const payload = { family_id: family.id, from_person_id: fromId, to_person_id: toId, relationship_type: relationshipType, parent_role: relationshipType === "parent_child" ? parentRole : null, created_by: user.id };
        const { data, error: relError } = await supabase.from("relationships").insert(payload).select("id,from_person_id,to_person_id,relationship_type,parent_role").single();
        if (relError) {
          await supabase.from("persons").delete().eq("id", person.id).eq("family_id", family.id);
          throw relError;
        }
        rel = data;
      }
      setPeople(old => [...old, person]);
      if (rel) setRelationships(old => [...old, rel!]);
      setShowAdd(false);
      setSelected(person);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save this person."); }
    finally { setBusy(false); }
  }


  async function updatePerson(formData: FormData) {
    if (!selected || !canEdit) return;
    setBusy(true); setError("");
    const display_name = String(formData.get("display_name") ?? "").trim();
    const native_name = String(formData.get("native_name") ?? "").trim() || null;
    const gender = String(formData.get("gender") ?? "unspecified");
    const birth_date = String(formData.get("birth_date") ?? "") || null;
    const biography = String(formData.get("biography") ?? "").trim() || null;
    if (!display_name) { setError("Name is required."); setBusy(false); return; }
    try {
      const supabase = createClient();
      const { data, error: updateError } = await supabase.from("persons").update({display_name,native_name,gender,birth_date,biography}).eq("id",selected.id).eq("family_id",family.id).select("id,display_name,native_name,gender,birth_date,biography").single();
      if (updateError) throw updateError;
      setPeople(old=>old.map(p=>p.id===data.id?data:p)); setSelected(data); setShowEdit(false);
    } catch(e) { setError(e instanceof Error?e.message:"Could not update this member."); }
    finally { setBusy(false); }
  }

  async function deletePerson(person: Person) {
    if (!canEdit) return;
    if (!window.confirm("Delete " + person.display_name + " from your family tree? Their relationship connections will also be removed. This cannot be undone.")) return;
    setBusy(true); setError("");
    try {
      const supabase=createClient();
      const {error: relError}=await supabase.from("relationships").delete().eq("family_id",family.id).or("from_person_id.eq."+person.id+",to_person_id.eq."+person.id);
      if(relError) throw relError;
      const {error: personError}=await supabase.from("persons").delete().eq("id",person.id).eq("family_id",family.id);
      if(personError) throw personError;
      setRelationships(old=>old.filter(r=>r.from_person_id!==person.id&&r.to_person_id!==person.id));
      setPeople(old=>old.filter(p=>p.id!==person.id));
      if(selected?.id===person.id){setSelected(null);setShowEdit(false);}
    } catch(e) {setError(e instanceof Error?e.message:"Could not delete this member.");}
    finally {setBusy(false);}
  }

  async function deleteRelationship(rel: Relationship) {
    if(!canEdit) return;
    if(!window.confirm("Remove this relationship connection? The family members themselves will remain.")) return;
    setBusy(true);setError("");
    try {
      const supabase=createClient();
      const {error: relError}=await supabase.from("relationships").delete().eq("id",rel.id).eq("family_id",family.id);
      if(relError)throw relError;
      setRelationships(old=>old.filter(r=>r.id!==rel.id));
    }catch(e){setError(e instanceof Error?e.message:"Could not remove relationship.");}
    finally{setBusy(false);}
  }

  return <main className="min-h-screen bg-[#f8f7f2] text-[#24372d]">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e7e9e0] bg-[#fffefa] px-5 py-4 sm:px-8">
      <div className="flex items-center gap-3"><Link href="/" className="grid h-10 w-10 place-items-center rounded-2xl bg-[#244b38] font-semibold text-white">V</Link><div><p className="text-xs text-[#879184]">Your private family</p><h1 className="font-semibold">{family.name}</h1></div><span className="rounded-full bg-[#edf2e8] px-3 py-1 text-xs text-[#52714f]">Private</span></div>
      <div className="flex gap-2"><Link href="/app/assistant" className="rounded-full border border-[#dce2d7] px-4 py-2.5 text-sm">Family AI</Link>{canEdit && <button onClick={() => {setSelected(null);setAddRelation("none");setShowAdd(true);setError("");}} className="rounded-full bg-[#244b38] px-5 py-2.5 text-sm font-semibold text-white">+ Add member</button>}</div>
    </header>
    <div className="grid min-h-[calc(100vh-73px)] lg:grid-cols-[1fr_310px]">
      <section className="relative min-h-[70vh] border-b border-[#e7e9e0] lg:border-b-0 lg:border-r">
        <div className="absolute left-5 top-5 z-10 rounded-2xl border border-[#e6e9e0] bg-white/95 px-4 py-3 shadow-sm"><p className="text-xs text-[#879184]">Family members</p><p className="text-xl font-semibold">{people.length}</p></div>
        {people.length === 0 ? <div className="absolute inset-0 grid place-items-center p-6"><div className="max-w-sm text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#e9efe3] text-3xl text-[#54734f]">♧</div><h2 className="mt-5 text-2xl font-semibold">Your family story starts here</h2><p className="mt-3 text-sm leading-6 text-[#768073]">Add yourself or a family member. Then connect parents, spouses and children to grow your tree.</p>{canEdit && <button onClick={() => setShowAdd(true)} className="mt-6 rounded-full bg-[#244b38] px-6 py-3 text-sm font-semibold text-white">Add your first member</button>}</div></div> : <ReactFlow nodes={diagramNodes} edges={graph.edges} onNodesChange={onNodesChange} fitView fitViewOptions={{padding:.22}} minZoom={0.08} maxZoom={2} nodesDraggable={canEdit} onNodeClick={(_, node) => setSelected(people.find(p => p.id === node.id) ?? null)} nodesConnectable={false} elementsSelectable proOptions={{hideAttribution:true}} defaultEdgeOptions={{type:"smoothstep",animated:false}}><Background color="#dfe4da" gap={22}/><Controls/><MiniMap pannable zoomable nodeColor="#b9cdb0"/></ReactFlow>}
      </section>
      <aside className="bg-[#fffefa] p-5 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#8b9685]">Family workspace</p><h2 className="mt-2 text-xl font-semibold">Your people</h2><p className="mt-2 text-sm leading-6 text-[#788174]">Select a member in the tree to see their profile. Your data is stored in your private workspace.</p><div className="mt-6 space-y-2">{people.map(p=><button key={p.id} onClick={()=>setSelected(p)} className="flex w-full items-center gap-3 rounded-2xl border border-[#edf0e8] p-3 text-left hover:bg-[#f8f9f5]"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#f1e9db] font-serif text-lg text-[#876d4e]">{(p.native_name||p.display_name).slice(0,1)}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{p.native_name||p.display_name}</span><span className="block text-xs text-[#92998e]">{p.gender && p.gender!=="unspecified" ? p.gender : "Family member"}</span></span></button>)}</div>
        {selected && <div className="mt-6 rounded-2xl border border-[#e5e9df] bg-[#f4f5ef] p-4"><div className="flex items-start justify-between gap-2"><div><p className="text-xs text-[#879184]">Selected profile</p><h3 className="mt-1 text-lg font-semibold">{selected.display_name}</h3>{selected.native_name && <p className="text-sm text-[#6e796b]">{selected.native_name}</p>}</div>{canEdit&&<button type="button" onClick={()=>{setError("");setShowEdit(true);}} className="rounded-xl border border-[#dce2d7] bg-white px-3 py-2 text-xs font-semibold text-[#315b3c] hover:bg-[#edf2e8]">Edit</button>}</div>{selected.gender&&selected.gender!=="unspecified"&&<p className="mt-2 text-sm capitalize text-[#6e796b]">{selected.gender}</p>}{selected.birth_date && <p className="mt-2 text-sm text-[#6e796b]">Born {selected.birth_date}</p>}{selected.biography && <p className="mt-3 text-sm leading-6 text-[#6e796b]">{selected.biography}</p>}
<p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#899386]">Connections</p><div className="mt-2 space-y-2">{relationships.filter(r=>r.from_person_id===selected.id||r.to_person_id===selected.id).map(r=>{const otherId=r.from_person_id===selected.id?r.to_person_id:r.from_person_id;const other=people.find(p=>p.id===otherId);const label=r.relationship_type==="spouse"?"Spouse":r.relationship_type==="partner"?"Partner":r.from_person_id===selected.id?"Parent of":"Child of";return <div key={r.id} className="flex items-center gap-2 rounded-xl border border-[#e4e8de] bg-white px-3 py-2"><span className="min-w-0 flex-1 text-xs text-[#566653]">{label}: <b>{other?.native_name||other?.display_name||"Family member"}</b></span>{canEdit&&<button type="button" disabled={busy} onClick={()=>deleteRelationship(r)} aria-label="Remove relationship" title="Remove connection" className="rounded-lg px-2 py-1 text-sm text-[#a34b45] hover:bg-red-50">×</button>}</div>})}{relationships.filter(r=>r.from_person_id===selected.id||r.to_person_id===selected.id).length===0&&<p className="text-xs text-[#92998e]">No connections yet.</p>}</div>
{error&&<p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}{canEdit&&<button type="button" disabled={busy} onClick={()=>deletePerson(selected)} className="mt-4 w-full rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50">{busy?"Working…":"Delete family member"}</button>}<button onClick={()=>setSelected(null)} className="mt-3 text-xs text-[#54734f] underline">Close profile</button></div>}
      </aside>
    </div>
    {showEdit && selected && <div className="fixed inset-0 z-[60] grid place-items-center bg-[#18251d]/50 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-member-title"><form action={updatePerson} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-[#fffefa] p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-[#879184]">Update family details</p><h2 id="edit-member-title" className="mt-2 text-2xl font-semibold">Edit member</h2></div><button type="button" onClick={()=>{setShowEdit(false);setError("");}} aria-label="Close edit form" className="rounded-full border px-3 py-1.5">×</button></div>
<label className="mt-6 block text-sm font-medium">Full name *<input name="display_name" required maxLength={160} defaultValue={selected.display_name} className="mt-2 w-full rounded-xl border border-[#dfe4da] bg-white px-4 py-3 outline-none focus:border-[#78916c]"/></label>
<label className="mt-4 block text-sm font-medium">Name in Hindi / native script<input name="native_name" maxLength={160} defaultValue={selected.native_name??""} placeholder="नाम (वैकल्पिक)" className="mt-2 w-full rounded-xl border border-[#dfe4da] bg-white px-4 py-3 outline-none focus:border-[#78916c]"/></label>
<label className="mt-4 block text-sm font-medium">Gender<select name="gender" defaultValue={selected.gender??"unspecified"} className="mt-2 w-full rounded-xl border border-[#dfe4da] bg-white px-4 py-3"><option value="unspecified">Prefer not to specify</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label>
<label className="mt-4 block text-sm font-medium">Date of birth<input name="birth_date" type="date" defaultValue={selected.birth_date??""} className="mt-2 w-full rounded-xl border border-[#dfe4da] bg-white px-4 py-3 outline-none focus:border-[#78916c]"/></label>
<label className="mt-4 block text-sm font-medium">Biography / notes<textarea name="biography" rows={4} maxLength={3000} defaultValue={selected.biography??""} placeholder="A little about this family member…" className="mt-2 w-full rounded-xl border border-[#dfe4da] bg-white px-4 py-3 outline-none focus:border-[#78916c]"/></label>
{error&&<p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="mt-6 flex gap-3"><button type="button" onClick={()=>{setShowEdit(false);setError("");}} className="flex-1 rounded-full border border-[#dce2d7] px-5 py-3.5 text-sm font-semibold">Cancel</button><button disabled={busy} className="flex-1 rounded-full bg-[#244b38] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-60">{busy?"Saving…":"Save changes"}</button></div></form></div>}
    {showAdd && <div className="fixed inset-0 z-50 grid place-items-center bg-[#18251d]/40 p-4" role="dialog" aria-modal="true"><form action={addPerson} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-[#fffefa] p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-[#879184]">Grow your family</p><h2 className="mt-2 text-2xl font-semibold">Add a member</h2></div><button type="button" onClick={()=>setShowAdd(false)} aria-label="Close" className="rounded-full border px-3 py-1.5">×</button></div>
      <label className="mt-6 block text-sm font-medium">Full name *<input name="display_name" required maxLength={160} placeholder="Enter full name" className="mt-2 w-full rounded-xl border border-[#dfe4da] bg-white px-4 py-3 outline-none focus:border-[#78916c]"/></label>
      <label className="mt-4 block text-sm font-medium">Name in Hindi / native script<input name="native_name" maxLength={160} placeholder="नाम (वैकल्पिक)" className="mt-2 w-full rounded-xl border border-[#dfe4da] bg-white px-4 py-3 outline-none focus:border-[#78916c]"/></label>
      <label className="mt-4 block text-sm font-medium">Gender (optional)<select name="gender" className="mt-2 w-full rounded-xl border border-[#dfe4da] bg-white px-4 py-3"><option value="unspecified">Prefer not to specify</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label>
      <div className="mt-5 rounded-2xl border border-[#e5e9df] bg-[#f8f9f5] p-4">
        <p className="text-sm font-semibold text-[#344b3b]">How are they connected?</p>
        <p className="mt-1 text-xs leading-5 text-[#879184]">Choose the relationship to another person already in your family tree.</p>
        <label className="mt-4 block text-sm font-medium">Relationship<select name="relation" defaultValue={addRelation} className="mt-2 w-full rounded-xl border border-[#dfe4da] bg-white px-4 py-3"><option value="none">Not connected yet</option><option value="parent">Parent of selected member (father / mother)</option><option value="child">Child of selected member (son / daughter)</option><option value="spouse">Spouse (wife / husband)</option><option value="partner">Partner</option></select></label>
        <label className="mt-4 block text-sm font-medium">Connect to family member<select name="related_person_id" defaultValue={selected?.id ?? ""} className="mt-2 w-full rounded-xl border border-[#dfe4da] bg-white px-4 py-3"><option value="">Choose a person</option>{people.map(p=><option key={p.id} value={p.id}>{p.native_name||p.display_name}</option>)}</select></label>
        <label className="mt-4 block text-sm font-medium">Parent relationship type<select name="parent_role" defaultValue="biological" className="mt-2 w-full rounded-xl border border-[#dfe4da] bg-white px-4 py-3"><option value="biological">Biological</option><option value="adoptive">Adoptive</option><option value="step">Step-parent</option><option value="foster">Foster</option><option value="legal">Legal guardian</option><option value="unknown">Unknown</option></select><span className="mt-1 block text-xs font-normal text-[#8a9385]">Used when you choose a parent or child relationship.</span></label>
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={busy} className="mt-6 w-full rounded-full bg-[#244b38] px-6 py-3.5 font-semibold text-white disabled:opacity-60">{busy?"Saving...":"Save family member"}</button></form></div>}
  </main>;
}

function buildGraph(people: Person[], relationships: Relationship[], onAddRelative: (personId: string, relation: "parent" | "child" | "spouse") => void): {nodes: Node[]; edges: Edge[]} {
  const valid = new Set(people.map(p=>p.id));
  const parents = new Map<string,string[]>(); const children = new Map<string,string[]>();
  for(const r of relationships.filter(r=>r.relationship_type==="parent_child"&&valid.has(r.from_person_id)&&valid.has(r.to_person_id))){parents.set(r.to_person_id,[...(parents.get(r.to_person_id)??[]),r.from_person_id]);children.set(r.from_person_id,[...(children.get(r.from_person_id)??[]),r.to_person_id]);}
  const depth = new Map<string,number>(); const queue = people.filter(p=>(parents.get(p.id)??[]).length===0).map(p=>({id:p.id,d:0}));
  while(queue.length){const item=queue.shift()!;if(depth.has(item.id))continue;depth.set(item.id,item.d);for(const child of children.get(item.id)??[])queue.push({id:child,d:item.d+1});}
  for(const p of people)if(!depth.has(p.id))depth.set(p.id,0);
  const groups=new Map<number,Person[]>();for(const p of people){const d=depth.get(p.id)??0;groups.set(d,[...(groups.get(d)??[]),p]);}
  for(const row of groups.values())for(let i=0;i<row.length;i++){const r=relationships.find(r=>["spouse","partner"].includes(r.relationship_type)&&((r.from_person_id===row[i].id&&row.some(p=>p.id===r.to_person_id))||(r.to_person_id===row[i].id&&row.some(p=>p.id===r.from_person_id))));if(r){const id=r.from_person_id===row[i].id?r.to_person_id:r.from_person_id;const j=row.findIndex(p=>p.id===id);if(j>=0&&j!==i+1){const [partner]=row.splice(j,1);row.splice(i+1,0,partner);}}}
  const nodes:Node[]=people.map(p=>{const d=depth.get(p.id)??0;const row=groups.get(d)??[];const i=row.findIndex(x=>x.id===p.id);return {id:p.id,position:{x:i*250-(row.length-1)*125,y:d*220},style:{width:196,border:"none",background:"transparent",padding:0},data:{label:
    <div className="relative w-[196px] rounded-2xl border border-[#dce4d6] bg-[#fffefa] px-3 pb-4 pt-4 text-center shadow-[0_8px_24px_rgba(35,60,42,.10)] transition hover:border-[#8fa986] hover:shadow-[0_12px_30px_rgba(35,60,42,.16)]">
      <button type="button" aria-label={`Add parent of ${p.display_name}`} title="Add parent" onClick={e=>{e.stopPropagation();onAddRelative(p.id,"parent");}} className="nodrag nopan absolute -top-3 left-1/2 z-10 grid h-7 w-7 -translate-x-1/2 place-items-center rounded-full border-2 border-white bg-[#e67e22] text-lg font-medium leading-none text-white shadow-md transition hover:scale-110">+</button>
      <button type="button" aria-label={`Add parent of ${p.display_name}`} title="Add parent" onClick={e=>{e.stopPropagation();onAddRelative(p.id,"parent");}} className="nodrag nopan absolute -left-3 top-1/2 z-10 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-[#e67e22] text-lg leading-none text-white shadow-md transition hover:scale-110">+</button>
      <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#f4e6cc] to-[#d8e6d1] font-serif text-2xl text-[#54734f]">{(p.native_name||p.display_name).slice(0,1)}</div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-[#899386]">{p.gender==="male"?"Male":p.gender==="female"?"Female":"Family member"}</div>
      <div className="mt-1 truncate text-sm font-semibold text-[#2b4031]">{p.native_name||p.display_name}</div>
      {p.birth_date&&<div className="mt-2 inline-flex rounded-full bg-[#f7ead7] px-2 py-0.5 text-[10px] text-[#a66c28]">{p.birth_date.slice(0,4)}</div>}
      <button type="button" aria-label={`Add child of ${p.display_name}`} title="Add child" onClick={e=>{e.stopPropagation();onAddRelative(p.id,"child");}} className="nodrag nopan absolute -bottom-3 left-1/2 z-10 grid h-7 w-7 -translate-x-1/2 place-items-center rounded-full border-2 border-white bg-[#e67e22] text-lg leading-none text-white shadow-md transition hover:scale-110">+</button>
      <button type="button" aria-label={`Add spouse or partner of ${p.display_name}`} title="Add spouse / partner" onClick={e=>{e.stopPropagation();onAddRelative(p.id,"spouse");}} className="nodrag nopan absolute -right-3 top-1/2 z-10 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-[#e67e22] text-lg leading-none text-white shadow-md transition hover:scale-110">+</button>
    </div>},type:"default"};});
  const edges:Edge[]=relationships.filter(r=>valid.has(r.from_person_id)&&valid.has(r.to_person_id)).map(r=>({id:r.id,source:r.from_person_id,target:r.to_person_id,type:r.relationship_type==="spouse"||r.relationship_type==="partner"?"straight":"smoothstep",label:r.relationship_type==="spouse"?"Spouse":r.relationship_type==="partner"?"Partner":undefined,labelStyle:{fill:"#71816c",fontSize:10,fontWeight:600},labelBgStyle:{fill:"#fffefa",fillOpacity:.95},style:{stroke:r.relationship_type==="spouse"||r.relationship_type==="partner"?"#d28b43":"#9bad92",strokeWidth:r.relationship_type==="spouse"||r.relationship_type==="partner"?2:1.8}}));
  return {nodes,edges};
}
