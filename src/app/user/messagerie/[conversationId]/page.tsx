// Cdw-Spm
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Message } from "@/types/messages";
import { useParams } from "next/navigation";

export default function ConversationPage(){
  const { conversationId } = useParams() as { conversationId: string };
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    let cancel=false;
    (async ()=>{
      try{
        const r = await fetch(`/api/user/conversations/${conversationId}/messages`, { cache: "no-store" });
        if(!r.ok) throw new Error("fallback");
        const j = await r.json();
        if(!cancel) setMessages(j?.messages ?? []);
      }catch{
        if(!cancel) setMessages([]);
      }finally{
        if(!cancel) setLoading(false);
      }
    })();
    return ()=>{ cancel = true; };
  },[conversationId]);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function send(){
    if(!text.trim()) return;
    alert("Envoi message (à implémenter)");
    setText("");
  }

  return (
    <main className="container-spy space-y-4 compact-sections">
      <section className="section">
        <nav className="text-sm text-muted">
          <Link href="/user/messagerie" className="hover:underline">Messagerie</Link>
          <span> / </span>
          <span>{conversationId}</span>
        </nav>
      </section>

      <section className="section">
        <div className="soft-card p-0 overflow-hidden">
          <header className="p-3 border-b">
            <div className="font-semibold">Conversation</div>
            <div className="text-xs text-muted">Réponse sous 24h en moyenne</div>
          </header>

          <div className="p-3 grid gap-2 max-h-[60vh] overflow-auto">
            {loading ? <div className="animate-pulse h-10 bg-slate-100 rounded"/> : (
              (messages ?? []).map(m=>(
                <div key={m.id} className={`max-w-[80%] rounded-xl px-3 py-2 ${m.author==="user"?"ml-auto bg-[#e7f6fb]":"bg-white border"}`}>
                  <div className="text-sm">{m.text}</div>
                  <div className="text-[11px] text-muted mt-1">{fmtDateTime(m.at)}</div>
                </div>
              ))
            )}
            <div ref={bottomRef}/>
          </div>

          <form className="p-3 border-t flex items-center gap-2" onSubmit={(e)=>{e.preventDefault(); send();}}>
            <input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Écrire un message…" className="input-pill"/>
            <button className="btn" type="submit">Envoyer</button>
          </form>
        </div>
      </section>
    </main>
  );
}

function fmtDateTime(iso: string){ try{const d=new Date(iso); return d.toLocaleDateString("fr-FR",{year:"numeric",month:"short",day:"2-digit"})+" "+d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});}catch{return iso;} }
