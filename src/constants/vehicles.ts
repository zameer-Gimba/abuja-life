export const VEHICLES = [
  { id: "city-hatch", name: "Abuja Compact", type: "hatchback", price: 3500000, tank: 45, efficiency: 12, maintenance: 35000, drivingRequired: 5, aura: 2 },
  { id: "sedan", name: "Capital Sedan", type: "sedan", price: 6500000, tank: 55, efficiency: 11, maintenance: 55000, drivingRequired: 10, aura: 5 },
  { id: "suv", name: "Guzape SUV", type: "suv", price: 12000000, tank: 70, efficiency: 9, maintenance: 90000, drivingRequired: 18, aura: 10 },
  { id: "executive", name: "Maitama Executive", type: "executive", price: 25000000, tank: 75, efficiency: 8, maintenance: 160000, drivingRequired: 25, aura: 18 },
] as const;

export type Vehicle = (typeof VEHICLES)[number];

export function getVehicle(id: string) {
  return VEHICLES.find((vehicle) => vehicle.id === id);
}

export function calculateFuelCost(vehicle: Vehicle, litres: number) {
  return Math.ceil(litres * 950);
}

export function calculateMaintenanceCost(vehicle: Vehicle, condition: number) {
  const wear = Math.max(0, 100 - condition);
  return Math.max(10000, Math.ceil(vehicle.maintenance * (wear / 100)));
}
