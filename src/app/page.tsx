import Link from "next/link";

const features = [
  { number: "01", icon: "✳", title: "A living family tree", body: "Map generations, connect relatives, and explore the relationships that make your family uniquely yours." },
  { number: "02", icon: "अ", title: "Made for Indian families", body: "Built with Hindi and English in mind, from dada-dadi to nana-nani and every branch in between." },
  { number: "03", icon: "✦", title: "Stories worth keeping", body: "Create a lasting place for names, memories, milestones, and the stories you want the next generation to know." },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#faf9f6] text-[#1e3328]">
      <header className="sticky top-0 z-30 border-b border-[#e9eae3]/80 bg-[#faf9f6]/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <Link href="/" className="group flex items-center gap-3" aria-label="Vansh home">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#244b38] text-xl font-semibold text-white shadow-lg shadow-[#244b38]/15 transition group-hover:rotate-[-4deg]">v.</span>
            <span><span className="block text-xl font-semibold tracking-[-.04em]">vansh</span><span className="hidden text-[10px] font-medium uppercase tracking-[.22em] text-[#899486] sm:block">Your family story</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-[#526456] transition hover:bg-[#eef1e9] sm:inline-flex">Sign in</Link>
            <Link href="/app/tree" className="inline-flex items-center gap-2 rounded-full bg-[#244b38] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-[#244b38]/15 transition hover:-translate-y-0.5 hover:bg-[#183727]">Create your tree <span aria-hidden="true">↗</span></Link>
          </div>
        </nav>
      </header>

      <section className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"><div className="absolute -right-32 top-[-5rem] h-[34rem] w-[34rem] rounded-full bg-[#e7ecdf] blur-3xl opacity-70"/><div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-[#f0e8d9] blur-3xl opacity-50"/></div>
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[.94fr_1.06fr] lg:gap-12 lg:px-12 lg:pb-28 lg:pt-24">
          <div className="animate-fade-up">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#dce4d8] bg-white/80 px-4 py-2 text-xs font-semibold text-[#58715a] shadow-sm"><span className="h-2 w-2 rounded-full bg-[#78a477] shadow-[0_0_0_4px_#e7f0e3]"/> A more meaningful way to stay connected</div>
            <h1 className="max-w-2xl text-[3.35rem] font-semibold leading-[1.02] tracking-[-.065em] sm:text-6xl lg:text-[4.65rem]">Every family has a <span className="font-serif font-normal italic text-[#78916c]">story.</span><br/><span className="text-[#244b38]">Keep yours growing.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-[#69766b] sm:text-lg">Bring generations together in one thoughtful, private space. Trace your roots, celebrate your people, and pass your family story forward.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/app/tree" className="inline-flex items-center justify-center gap-3 rounded-full bg-[#244b38] px-7 py-4 text-sm font-semibold text-white shadow-xl shadow-[#244b38]/20 transition hover:-translate-y-1 hover:bg-[#183727]">Start your family tree <span className="text-lg">→</span></Link><a href="#why-vansh" className="inline-flex items-center justify-center rounded-full border border-[#d9dfd5] bg-white/80 px-7 py-4 text-sm font-semibold text-[#405546] transition hover:border-[#b8c6b3] hover:bg-white">Discover Vansh</a></div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-medium text-[#7c887c]"><span className="inline-flex items-center gap-2"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg> Private family space</span><span className="h-1 w-1 rounded-full bg-[#b8c1b4]"/><span>Hindi + English</span><span className="h-1 w-1 rounded-full bg-[#b8c1b4]"/><span>Made for every generation</span></div>
          </div>

          <div className="relative mx-auto w-full max-w-[610px] animate-fade-up [animation-delay:150ms]">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-[#e7ecdf] via-[#f2eee4] to-[#dfe8dc] blur-2xl opacity-80"/>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/90 bg-white/90 p-5 shadow-[0_35px_100px_-38px_rgba(36,75,56,.32)] backdrop-blur sm:p-7">
              <div className="flex items-start justify-between border-b border-[#edf0e9] pb-5"><div><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-[#8b9686]"><span className="h-1.5 w-1.5 rounded-full bg-[#78a477]"/> A glimpse into your roots</div><h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">The Patel Family</h2><p className="mt-1 text-xs text-[#899386]">A story across generations</p></div><span className="rounded-full border border-[#dfe8d9] bg-[#f1f5ed] px-3 py-1.5 text-[11px] font-semibold text-[#557451]">3 generations</span></div>
              <div className="relative py-7">
                <div className="absolute left-1/2 top-[5.8rem] h-9 w-px -translate-x-1/2 bg-[#cbd7c5]"/><div className="absolute left-[25%] right-[25%] top-[7.95rem] h-px bg-[#cbd7c5]"/><div className="absolute left-[25%] top-[7.95rem] h-5 w-px bg-[#cbd7c5]"/><div className="absolute right-[25%] top-[7.95rem] h-5 w-px bg-[#cbd7c5]"/>
                <div className="mx-auto flex w-fit flex-col items-center"><Member initials="द" name="Dadaji & Dadiji" sub="Generation 1" tone="sand"/></div>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5"><Member initials="प" name="Papa & Mummy" sub="Generation 2" tone="sage"/><Member initials="च" name="Chacha & Chachi" sub="Generation 2" tone="sage"/></div>
                <div className="mx-auto mt-5 h-7 w-px bg-[#cbd7c5]"/>
                <div className="mx-auto max-w-[255px] rounded-2xl border border-[#b8cbae] bg-gradient-to-br from-[#f1f6ed] to-[#e7f0e1] p-4 text-center shadow-[0_10px_30px_-18px_rgba(36,75,56,.35)]"><div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[#d7e5ce] text-sm font-semibold text-[#31553b]">You</div><p className="mt-2 text-sm font-semibold text-[#294331]">Your branch begins here</p><p className="mt-1 text-[11px] text-[#75866e]">Add your family. Keep the story alive.</p></div>
              </div>
              <div className="flex items-center justify-between border-t border-[#edf0e9] pt-4 text-[10px] text-[#9aa396]"><span>Illustrative preview</span><span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#80a879]"/> Your family, your space</span></div>
            </div>
            <div className="absolute -left-5 top-[28%] hidden items-center gap-3 rounded-2xl border border-white bg-white/95 p-3.5 shadow-xl shadow-[#344b37]/10 sm:flex"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f2eadd] text-lg text-[#8c704c]">⌂</span><span><span className="block text-xs font-semibold text-[#314535]">Your roots, remembered</span><span className="mt-0.5 block text-[10px] text-[#8b9588]">One connected family</span></span></div>
          </div>
        </div>
      </section>

      <section id="why-vansh" className="border-y border-[#e9ebe4] bg-white/70">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div className="max-w-2xl"><p className="text-[11px] font-bold uppercase tracking-[.24em] text-[#7e9275]">Rooted in connection</p><h2 className="mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-4xl">More than names and lines.</h2></div><p className="max-w-md text-sm leading-7 text-[#758075]">A beautiful home for the people, relationships, and memories that make your family yours.</p></div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">{features.map((feature)=><article key={feature.number} className="group rounded-[1.65rem] border border-[#e8ebe3] bg-[#fdfdfa] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#cbd8c4] hover:bg-white hover:shadow-[0_22px_55px_-35px_rgba(36,75,56,.3)] sm:p-7"><div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#edf2e8] text-xl text-[#416246] transition group-hover:bg-[#244b38] group-hover:text-white">{feature.icon}</span><span className="text-xs font-semibold tracking-widest text-[#b1b9ac]">{feature.number}</span></div><h3 className="mt-7 text-lg font-semibold tracking-tight">{feature.title}</h3><p className="mt-3 text-sm leading-7 text-[#748073]">{feature.body}</p></article>)}</div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 rounded-[2rem] bg-[#244b38] px-7 py-10 text-white shadow-[0_30px_70px_-35px_rgba(36,75,56,.6)] sm:px-12 sm:py-12 md:flex-row md:items-center"><div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#b6c9ad]">Your story starts with you</p><h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Every generation deserves to be remembered.</h2><p className="mt-3 max-w-lg text-sm leading-7 text-[#d0dbcd]">Start building your family tree today, one name and one story at a time.</p></div><Link href="/app/tree" className="inline-flex shrink-0 items-center gap-3 rounded-full bg-[#f7f7ef] px-7 py-4 text-sm font-semibold text-[#244b38] transition hover:-translate-y-0.5 hover:bg-white">Build your family tree <span>→</span></Link></div></section>

      <footer className="border-t border-[#e8ebe3] px-5 py-7 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-[#899387] sm:flex-row sm:items-center sm:justify-between"><Link href="/" className="flex items-center gap-2 font-semibold text-[#536653]"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#244b38] text-[11px] text-white">v.</span> vansh</Link><span>© 2026 Vansh · Every family has a story.</span><span>Made with care for the stories that make us.</span></div></footer>
    </main>
  );
}

function Member({ initials, name, sub, tone }: { initials: string; name: string; sub: string; tone: "sand" | "sage" }) {
  return <div className="relative z-10 flex min-w-0 flex-col items-center rounded-2xl border border-[#e6e9e1] bg-white/95 px-2 py-4 text-center shadow-[0_8px_25px_-20px_rgba(30,51,40,.35)] sm:px-4"><span className={`mb-2 grid h-10 w-10 place-items-center rounded-full font-serif text-lg ${tone === "sand" ? "bg-[#f2eadd] text-[#8c704c]" : "bg-[#eaf0e5] text-[#54734f]"}`}>{initials}</span><p className="text-xs font-semibold text-[#314535] sm:text-sm">{name}</p><p className="mt-1 text-[10px] text-[#929b8e]">{sub}</p></div>;
}
