// Cdw-Spm
'use client';
import type { Message } from './types';

type Props = { messages: Message[] };

export default function MessageList({ messages }: Props) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((m) => (
        <div key={m.id} className="flex gap-3 items-start">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">{m.avatar}</div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-medium">{m.user}</span>
              <span className="text-xs text-muted">{m.timestamp}</span>
            </div>
            <p className="text-sm">{m.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
