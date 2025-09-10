'use client';
import type { Channel } from './types';

type Props = {
  channels: Channel[];
  current: Channel;
  onSelect: (c: Channel) => void;
};

export default function ChannelList({ channels, current, onSelect }: Props) {
  return (
    <aside className="bg-white border-r border-gray-200 p-3 flex flex-col gap-2">
      <h2 className="text-sm font-bold mb-2">Salons</h2>
      {channels.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c)}
          className={`text-left px-3 py-2 rounded-md text-sm transition ${
            c.id === current.id ? 'bg-accent text-white' : 'hover:bg-gray-100'
          }`}
        >
          {c.name}
        </button>
      ))}
    </aside>
  );
}
