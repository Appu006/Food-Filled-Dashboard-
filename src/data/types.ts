export interface Agency {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  monthlyMeals: number; // admin-entered estimated monthly output, in meals (FR-06)
  active: boolean;
  createdAt: Date;
}

export interface DeliveryEntry {
  id: string;
  agencyId: string;
  weightKg: number;
  date: Date; // captured automatically (FR-03)
}
