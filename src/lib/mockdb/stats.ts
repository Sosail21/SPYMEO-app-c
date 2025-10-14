// Cdw-Spm
export function getStats(range: string) {
  const now = new Date();
  return {
    kpis: [
      { label: "Nouveaux clients", value: 12 },
      { label: "Consultations", value: 34 },
      { label: "CA (€)", value: 1230 },
      { label: "Clients totaux", value: 87 },
      { label: "Annulations", value: 3 },
      { label: "% remplissage", value: "78%" },
    ],
    charts: {
      consultations: {
        labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
        datasets: [{ label: "Consultations", data: [2, 5, 3, 4, 6, 2, 1], borderColor: "#17a2b8", backgroundColor: "#17a2b888" }],
      },
      ca: {
        labels: ["S1", "S2", "S3", "S4"],
        datasets: [{ label: "CA (€)", data: [400, 300, 500, 700], backgroundColor: "#0b1239" }],
      },
    },
  };
}
