export type IArea = {
  name: string;
  note?: string;
  status?: "Active" | "Inactive";

  coverage_radius: number;

  latitude: number;
  longitude: number;

  zoom?: number;
};
