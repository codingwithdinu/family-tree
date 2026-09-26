"use client";
import Link from "next/link";
import { useState } from "react";

type Person={id:string;display_name:string;native_name:string|null;gender:string|null;birth_date:string|null};
type Message={role:"user"|"assistant";content:string};

export function FamilyAIChat({familyId,familyName,defaultLanguage,people}:{familyId:string;familyName:string;defaultLanguage:string;people:Person[]}){
 const [referenceId,setReferenceId]=useState("");
 const [question,setQuestion]=useState("");
 const [messages,setMessages]=useState<Message[]>([]);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 async function ask(q?:string){
  const prompt=(q??question).trim();if(!prompt||busy)return;
  setMessages(old=>[...old,{role:"user",content:prompt}]);setQuestion("");setBusy(true);setError("");
  try{
   const res=await fetch("/api/family-ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({familyId,question:prompt,referencePersonId:referenceId||null,language:defaultLanguage})});
   const data=await res.json();if(!res.ok)throw new Error(data.error||"Family AI request failed.");
   setMessages(old=>[...old,{role:"assistant",content:data.answer}]);
  }catch(e){setError(e instanceof Error?e.message:"Something went wrong.");}
  finally{setBusy(false);}
 }
 return <main className="min-h-[100dvh] bg-[#f7f7f1] text-[#24372d]">
  <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[#e3e7dd] bg-[#fffefa]/95 px-4 py-3 backdrop-blur sm:px-8">
   <div className="flex min-w-0 items-center gap-3"><Link href="/app/tree" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#244b38] font-bold text-white">V</Link><div className="min-w-0"><p className="text-xs text-[#879184]">Vansh · Family AI</p><h1 className="truncate font-semibold">{familyName}</h1></div></div>
   <Link href="/app/tree" className="rounded-full border border-[#dce2d7] px-4 py-2 text-sm font-medium">Family tree</Link>
  </header>
  <div className="mx-auto flex min-h-[calc(100dvh-62px)] max-w-4xl flex-col px-3 pb-4 sm:px-6">
   <div className="py-6 sm:py-10"><span className="rounded-full bg-[#e9efe4] px-3 py-1.5 text-xs font-semibold text-[#54704e]">Indian relationship expert</span><h2 className="mt-4 text-2xl font-semibold sm:text-4xl">Ask your family anything.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#748071]">Ask who is related to whom. Answers are grounded in the family tree you have entered, with Indian kinship terms in Hindi, Hinglish or English.</p>
   <label className="mt-5 block max-w-md text-sm font-medium">Relation from whose perspective? <select value={referenceId} onChange={e=>setReferenceId(e.target.value)} className="mt-2 w-full rounded-xl border border-[#dfe4da] bg-white px-4 py-3"><option value="">Use the relationship stated in my question</option>{people.map(p=><option key={p.id} value={p.id}>{p.native_name||p.display_name}</option>)}</select></label>
   </div>
   {messages.length===0?<div className="grid gap-3 sm:grid-cols-2">{["Ganesh Ba ke bhai ka beta mera kya lagega?","Mere dada ke bhai ki wife ko kya bolte hain?","Family tree mein mere mama kaun hain?","Who are this person's children and spouse?"].map(q=><button key={q} onClick={()=>ask(q)} className="rounded-2xl border border-[#e2e7dc] bg-white p-4 text-left text-sm leading-6 shadow-sm hover:border-[#9daf91]">{q}<span className="ml-2 text-[#6c8961]">↗</span></button>)}</div>:<div className="flex-1 space-y-4 pb-6">{messages.map((m,i)=><div key={i} className={m.role==="user"?"ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-[#244b38] px-4 py-3 text-sm leading-6 text-white":"mr-auto max-w-[95%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-[#e2e7dc] bg-white px-4 py-4 text-sm leading-7 shadow-sm"}>{m.content}</div>)}{busy&&<div className="mr-auto rounded-2xl border border-[#e2e7dc] bg-white px-4 py-3 text-sm text-[#71806d]">Family AI is checking your family tree…</div>}</div>}
   {error&&<div role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
   <form onSubmit={e=>{e.preventDefault();void ask();}} className="sticky bottom-0 mt-auto border border-[#dfe4da] bg-white p-2 shadow-lg shadow-[#24372d]/5 rounded-2xl"><textarea value={question} onChange={e=>setQuestion(e.target.value)} rows={2} placeholder="Ask in Hindi, Hinglish or English…" className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[#9aa397]" /><div className="flex items-center justify-between gap-3 px-2 pb-1"><p className="text-xs text-[#899285]">Answers use saved family links; missing links may limit accuracy.</p><button disabled={busy||!question.trim()} className="shrink-0 rounded-full bg-[#244b38] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy?"Thinking…":"Ask AI ↗"}</button></div></form>
  </div>
 </main>;
}
