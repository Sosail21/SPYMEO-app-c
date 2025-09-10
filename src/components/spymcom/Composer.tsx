'use client';
import { useState } from 'react';

type Props = { onSend: (content: string) => void };

export default function Composer({ onSend }: Props) {
  const [value, setValue] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <form onSubmit={handleSend} className="p-3 border-t border-gray-200 bg-white flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Écrire un message..."
        className="flex-1 px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-accent"
      />
      <button type="submit" className="btn">Envoyer</button>
    </form>
  );
}
