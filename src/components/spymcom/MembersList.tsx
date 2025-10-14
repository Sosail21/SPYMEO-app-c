// Cdw-Spm
'use client';

const MOCK_MEMBERS = [
  { id: '1', name: 'Alice', avatar: '🧘' },
  { id: '2', name: 'Bob', avatar: '🌿' },
  { id: '3', name: 'Charlie', avatar: '💻' },
];

export default function MembersList() {
  return (
    <aside className="bg-white border-l border-gray-200 p-3 flex flex-col gap-2">
      <h2 className="text-sm font-bold mb-2">Membres connectés</h2>
      {MOCK_MEMBERS.map((m) => (
        <div key={m.id} className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">{m.avatar}</div>
          <span>{m.name}</span>
        </div>
      ))}
    </aside>
  );
}
