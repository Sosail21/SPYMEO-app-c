
// src/components/cabinet/mock.ts
import type { Annonce } from "./types";

export const MOCK_ANNONCES: Annonce[] = [
  { id:"ann-1", kind:"offer", title:"Salle lumineuse", description:"18m² disponible 3j/semaine", images:["https://picsum.photos/400/200?1"], city:"Dijon", surface:18, equiped:true, author:{id:"pro-123", name:"Léa"} },
  { id:"ann-2", kind:"demand", title:"Recherche partage", description:"Je cherche un espace calme 2j/semaine", images:["https://picsum.photos/400/200?2"], city:"Beaune", surface:12, equiped:false, author:{id:"pro-456", name:"Nicolas"} },
];

export function getCabinet(id:string){ return MOCK_ANNONCES.find(a=>a.id===id); }
