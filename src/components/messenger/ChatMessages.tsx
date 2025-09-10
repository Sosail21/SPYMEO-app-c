'use client';
import { useEffect, useRef } from 'react';
import type { ChatMessage, User } from './types';

function Bubble({ me, msg }: { me: User; msg: ChatMessage }) {
  const mine = msg.from === me.id;
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[78%] rounded-2xl px-3 py-2 shadow-elev text-sm
        ${mine ? "bg-accent text-white rounded-br-sm" : "bg-white border border-border rounded-bl-sm"}`}>
        {msg.text}
        <div className={`text-[10px] mt-1 ${mine ? "text-white/80" : "text-muted"}`}>
          {new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
        </div>
      </div>
    </div>
  );
}

export default function ChatMessages({ me, items }: { me: User; items: ChatMessage[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight }); }, [items]);

  return (
    <div ref={ref} className="flex-1 overflow-y-auto">
      <div className="container-spy py-4 grid gap-2">
        {items.map(m => <Bubble key={m.id} me={me} msg={m} />)}
      </div>
    </div>
  );
}
