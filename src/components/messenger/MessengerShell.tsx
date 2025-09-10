'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import ConversationList from './ConversationList';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatComposer from './ChatComposer';
import ChatInfo from './ChatInfo';
import type { Conversation, ChatMessage, User } from './types';

// ==== MOCK DATA ====
const ME: User = { id: 'me', name: 'Vous', avatar: '🙂', role: 'PRACTITIONER' };
const U1: User = { id: 'u1', name: 'Camille (PASS)', avatar: '🧘', role: 'PASS' };
const U2: User = { id: 'u2', name: 'Atelier Bois & Co', avatar: '🪵', role: 'ARTISAN' };
const U3: User = { id: 'u3', name: 'Centre Respire', avatar: '🏫', role: 'CENTER' };

function now() { return new Date().toISOString(); }

const INITIAL_CONV: Conversation[] = [
  { id: 'c1', with: U1, lastMessage: 'Merci pour vos conseils !', lastAt: now(), unread: 2, pinned: true },
  { id: 'c2', with: U2, lastMessage: 'Devis reçu 👍', lastAt: now() },
  { id: 'c3', with: U3, lastMessage: 'Prochaine session le 12/10', lastAt: now() },
];

const INITIAL_MSGS: Record<string, ChatMessage[]> = {
  c1: [
    { id: 'm1', from: 'u1', to: 'me', text: 'Bonjour 🙂', createdAt: now(), read: true },
    { id: 'm2', from: 'me', to: 'u1', text: 'Hello Camille !', createdAt: now(), read: true },
    { id: 'm3', from: 'u1', to: 'me', text: 'Merci pour vos conseils !', createdAt: now(), read: false },
  ],
  c2: [
    { id: 'm1', from: 'u2', to: 'me', text: 'Devis envoyé par mail', createdAt: now(), read: true },
    { id: 'm2', from: 'me', to: 'u2', text: 'Bien reçu, merci.', createdAt: now(), read: true },
  ],
  c3: [
    { id: 'm1', from: 'u3', to: 'me', text: 'La prochaine session est le 12/10', createdAt: now(), read: true },
  ],
};

export default function MessengerShell() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONV);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MSGS);
  const [activeId, setActiveId] = useState<string>('c1');
  const [showInfo, setShowInfo] = useState<boolean>(true);
  const [mobileListOpen, setMobileListOpen] = useState<boolean>(false);

  const activeConv = useMemo(
    () => conversations.find(c => c.id === activeId),
    [activeId, conversations]
  );
  const activeMsgs = messages[activeId] || [];

  // mark read when opening
  useEffect(() => {
    setConversations(prev => prev.map(c => c.id === activeId ? { ...c, unread: 0 } : c));
    // mark last message read
    setMessages(prev => {
      const arr = prev[activeId] ?? [];
      const upd = arr.map((m, idx) => idx === arr.length - 1 ? { ...m, read: true } : m);
      return { ...prev, [activeId]: upd };
    });
  }, [activeId]);

  function send(text: string) {
    if (!text.trim() || !activeConv) return;
    const msg: ChatMessage = {
      id: 'm' + Math.random().toString(36).slice(2),
      from: ME.id,
      to: activeConv.with.id,
      text,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages(prev => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), msg],
    }));
    setConversations(prev => prev.map(c => c.id === activeId ? { ...c, lastMessage: text, lastAt: msg.createdAt } : c));
  }

  function searchConv(q: string) {
    const s = q.trim().toLowerCase();
    if (!s) return INITIAL_CONV;
    return INITIAL_CONV.filter(c =>
      c.with.name.toLowerCase().includes(s) ||
      (c.lastMessage || '').toLowerCase().includes(s)
    );
  }

  function onSearch(q: string) {
    setConversations(searchConv(q));
  }

  return (
    <div className="h-[calc(100vh-56px)] bg-[#f7fbfd]">
      <div className="grid md:grid-cols-[340px_minmax(0,1fr)_300px] h-full">

        {/* Left: conversations list (drawer on mobile) */}
        <aside className={`bg-white border-r border-border md:static fixed inset-y-0 left-0 z-40 w-[88%] max-w-[360px] transition-transform
          ${mobileListOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
          <ConversationList
            me={ME}
            conversations={conversations}
            activeId={activeId}
            onSelect={(id) => { setActiveId(id); setMobileListOpen(false); }}
            onSearch={onSearch}
          />
        </aside>

        {/* Center: chat */}
        <main className="min-w-0 flex flex-col">
          <div className="md:hidden flex items-center justify-between p-3 bg-white border-b border-border sticky top-0 z-30">
            <button className="btn btn-ghost px-3" onClick={() => setMobileListOpen(v => !v)}>☰</button>
            <div className="font-semibold truncate">{activeConv?.with.name ?? "…"}</div>
            <button className="btn btn-ghost px-3" onClick={() => setShowInfo(v => !v)}>ℹ️</button>
          </div>

          <ChatHeader me={ME} other={activeConv?.with} onToggleInfo={() => setShowInfo(v => !v)} />
          <ChatMessages me={ME} items={activeMsgs} />
          <ChatComposer onSend={send} />
        </main>

        {/* Right: info panel */}
        <aside className={`bg-white border-l border-border md:static fixed inset-y-0 right-0 z-40 w-[86%] max-w-[320px] transition-transform
          ${showInfo ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
          <ChatInfo me={ME} other={activeConv?.with} />
        </aside>
      </div>
    </div>
  );
}
