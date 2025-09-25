type Props={title:string;level?:string;views?:string;bg:string;href?:string;ribbonText?:string;};
export default function RibbonCard({title,level,views,bg,href="#",ribbonText}:Props){
  return(
    <a href={href} className="relative block aspect-[4/3] rounded-[22px] overflow-hidden shadow-sm border border-slate-200/70 hover:shadow-md transition" style={{backgroundImage:`url(${bg})`,backgroundSize:"cover",backgroundPosition:"center"}}>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.38))]" />
      {level && <div className="absolute left-3 top-3 px-2 py-0.5 rounded-lg text-[11px] bg-white/90 text-slate-900 shadow">{level}</div>}
      <div className="absolute left-3 right-3 bottom-3">
        <div className="rounded-[14px] px-4 py-2 font-semibold uppercase tracking-wider text-[13px] text-white shadow-lg ring-1 ring-black/10"
             style={{background:"linear-gradient(135deg,#caa755 0%,#e0c167 45%,#f1da8a 55%,#b88f3e 100%)"}}>{ribbonText??title}</div>
        {views && <div className="mt-1 text-[11px] text-white/90 drop-shadow">{views} просмотров</div>}
      </div>
    </a>
  );
}
