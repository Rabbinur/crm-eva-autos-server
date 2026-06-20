export type WeightUnit =
  | "lb" // pound
  | "oz" // ounce
  | "kg" // kilogram (less common in US)
  | "g"; // gram (less common in US)
export type VolumeUnit =
  | "fl oz" // fluid ounce
  | "pint"
  | "quart"
  | "gallon"
  | "liter" // metric
  | "ml"; // metric
export type ServingUnit =
  | "piece"
  | "slice"
  | "plate"
  | "cup"
  | "bowl"
  | "serving"
  | "dozen"
  | "pack"
  | "tray"
  | "box"
  | "bottle";

export type Unit = WeightUnit | VolumeUnit | ServingUnit;
