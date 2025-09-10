'use client';
import type { Channel } from './types';

type Props = { channel: Channel };

export default function ThreadHeader({ channel }: Props) {
  return (
    <header className="px-4 py-3 border-b border-gray-200 bg-white font-semibold">
      {channel.name}
    </header>
  );
}
