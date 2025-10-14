// Cdw-Spm
'use client';
import { useState } from 'react';
import ChannelList from './ChannelList';
import ThreadHeader from './ThreadHeader';
import MessageList from './MessageList';
import Composer from './Composer';
import MembersList from './MembersList';
import type { Channel, Message } from './types';

const MOCK_CHANNELS: Channel[] = [
  { id: 'general', name: '💬 Général' },
  { id: 'bien-etre', name: '🌱 Bien-être' },
  { id: 'projets', name: '🚀 Projets' },
];

const MOCK_MESSAGES: Message[] = [
  { id: '1', user: 'Alice', avatar: '🧘', content: 'Bienvenue dans le Spym’Com ✨', timestamp: '10:01' },
  { id: '2', user: 'Bob', avatar: '🌿', content: 'Salut tout le monde 👋', timestamp: '10:03' },
];

export default function SpymComShell() {
  const [channel, setChannel] = useState<Channel>(MOCK_CHANNELS[0]);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);

  const sendMessage = (content: string) => {
    const msg: Message = {
      id: Date.now().toString(),
      user: 'Moi',
      avatar: '🙂',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, msg]);
  };

  return (
    <div className="h-screen grid grid-cols-[240px_1fr_240px] bg-[#f8fafc]">
      <ChannelList channels={MOCK_CHANNELS} current={channel} onSelect={setChannel} />
      <div className="flex flex-col">
        <ThreadHeader channel={channel} />
        <MessageList messages={messages} />
        <Composer onSend={sendMessage} />
      </div>
      <MembersList />
    </div>
  );
}
