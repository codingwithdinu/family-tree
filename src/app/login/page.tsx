"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [mode,setMode]=useState<"login"|"signup">("login");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setMessage("");try{const supabase=createClient();const result=mode==="login"?await supabase.auth.signInWithPassword({email,password}):await supabase.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin+"/app/tree"}});if(result.error)throw result.error;if(mode==="signup"&&!result.data.session)setMessage("Check your email to confirm your account, then sign in.");else window.location.href="/app/tree";}catch(err){setMessage(err instanceof Error?err.message:"Authentication failed.");}finally{setBusy(false);}}
  async function google(){setBusy(true);setMessage("");try{const supabase=createClient();const {error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.origin+"/app/tree"}});if(error)throw error;}catch(err){setMessage(err instanceof Error?err.message:"Google sign-in could not start.");setBusy(false);}}
  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#1e3328] lg:grid lg:grid-cols-[1fr_1fr]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#244b38] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -right-40 -top-32 h-[32rem] w-[32rem] rounded-full border border-white/10"/><div className="absolute -right-20 -top-12 h-[24rem] w-[24rem] rounded-full border border-white/10"/><div className="absolute -bottom-40 -left-32 h-[34rem] w-[34rem] rounded-full bg-[#6d8961]/20 blur-3xl"/>
        <Link href="/" className="relative z-10 flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-xl font-semibold text-[#244b38]">v.</span><span className="text-2xl font-semibold tracking-[-.04em]">vansh</span></Link>
        <div className="relative z-10 max-w-xl"><p className="text-[11px] font-bold uppercase tracking-[.25em] text-[#b9cdb2]">Every family has a story</p><h1 className="mt-5 text-5xl font-semibold leading-[1.08] tracking-[-.055em] xl:text-6xl">Keep your roots close. <span className="font-serif font-normal italic text-[#c4d6b8]">Keep your story alive.</span></h1><p className="mt-6 max-w-md text-base leading-8 text-[#d2dfce]">A private space to bring generations together, remember the people who came before, and build something meaningful for those who come next.</p>
          <div className="mt-10 flex items-center gap-3"><div className="flex -space-x-2">{["द","પ","अ"].map((x,i)=><span key={i} className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#244b38] bg-[#e5ebdc] font-serif text-sm text-[#35583b]">{x}</span>)}</div><span className="text-xs text-[#c5d5bf]">Made for families, across generations</span></div>
        </div>
        <p className="relative z-10 text-xs text-[#b6c9b0]">© 2026 Vansh · Your family, your space.</p>
      </aside>
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 inline-flex items-center gap-3 lg:hidden"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#244b38] font-semibold text-white">v.</span><span className="text-xl font-semibold tracking-tight">vansh</span></Link>
          <Link href="/" className="mb-10 hidden items-center gap-2 text-sm font-medium text-[#788477] transition hover:text-[#244b38] lg:inline-flex">← Back to home</Link>
          <div className="mb-8"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#dce5d7] bg-[#f0f4eb] px-3 py-1.5 text-[11px] font-semibold text-[#5a7654]"><span className="h-1.5 w-1.5 rounded-full bg-[#7ba574]"/> Your family, together</div><h2 className="text-3xl font-semibold tracking-[-.045em] sm:text-4xl">{mode==="login"?"Welcome back":"Create your account"}</h2><p className="mt-3 text-sm leading-6 text-[#748073]">{mode==="login"?"Sign in to continue building your family's story.":"Create your private space and start connecting generations."}</p></div>
          <button onClick={google} disabled={busy} className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#dce2d7] bg-white px-5 py-3.5 text-sm font-semibold text-[#344b3b] shadow-sm transition hover:border-[#b9c8b3] hover:bg-[#fdfefb] disabled:opacity-60"><GoogleIcon/> Continue with Google</button>
          <div className="my-6 flex items-center gap-4 text-[11px] font-medium text-[#9aa396]"><span className="h-px flex-1 bg-[#e5e9e1]"/>OR WITH EMAIL<span className="h-px flex-1 bg-[#e5e9e1]"/></div>
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-semibold text-[#354a39]">Email address<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-2xl border border-[#dfe4da] bg-white px-4 py-3.5 text-sm font-normal outline-none transition placeholder:text-[#a5ada1] focus:border-[#78916c] focus:ring-4 focus:ring-[#78916c]/10" placeholder="you@example.com"/></label>
            <label className="block text-sm font-semibold text-[#354a39]">Password<input type="password" required minLength={8} autoComplete={mode==="login"?"current-password":"new-password"} value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-2xl border border-[#dfe4da] bg-white px-4 py-3.5 text-sm font-normal outline-none transition placeholder:text-[#a5ada1] focus:border-[#78916c] focus:ring-4 focus:ring-[#78916c]/10" placeholder="At least 8 characters"/></label>
            {message&&<p role="status" className="rounded-2xl border border-[#dce7d5] bg-[#f0f5eb] p-4 text-sm leading-6 text-[#526b4d]">{message}</p>}
            <button disabled={busy} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#244b38] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-[#244b38]/15 transition hover:-translate-y-0.5 hover:bg-[#183727] disabled:opacity-60">{busy?"Please wait…":mode==="login"?"Sign in to Vansh":"Create my account"}{!busy&&<span className="text-lg">→</span>}</button>
          </form>
          <p className="mt-7 text-center text-sm text-[#778174]">{mode==="login"?"New to Vansh?":"Already have an account?"} <button onClick={()=>{setMode(mode==="login"?"signup":"login");setMessage("");}} className="font-semibold text-[#315b3c] underline decoration-[#a9bea0] underline-offset-4 transition hover:text-[#244b38]">{mode==="login"?"Create an account":"Sign in"}</button></p>
          <div className="mt-8 flex items-start justify-center gap-2 text-center text-[11px] leading-5 text-[#9aa396]"><span className="mt-0.5">♧</span><span>Your family tree is private. Your account keeps your family's information in its own protected workspace.</span></div>
        </div>
      </section>
    </main>
  );
}

function GoogleIcon(){return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.28-1.93-6.15-4.53H2.16v2.84A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.85 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.35-2.11V7.05H2.16A11 11 0 0 0 1 12c0 1.78.43 3.46 1.16 4.95l3.69-2.84Z"/><path fill="#EA4335" d="M12 5.36c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.98 14.97 1 12 1a11 11 0 0 0-9.84 6.05l3.69 2.84C6.72 7.29 9.14 5.36 12 5.36Z"/></svg>}
