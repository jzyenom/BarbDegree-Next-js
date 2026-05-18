export const DEFAULT_BARBER_SERVICES = [
  {
    name: "Trimming",
    nameKey: "trimming",
    description: "Default trimming service",
    price: 3000,
    durationMinutes: 30,
  },
  {
    name: "Shaving",
    nameKey: "shaving",
    description: "Default shaving service",
    price: 1500,
    durationMinutes: 20,
  },
  {
    name: "Dyeing",
    nameKey: "dyeing",
    description: "Default dyeing service",
    price: 5000,
    durationMinutes: 60,
  },
] as const;
