import { Camera, FlaskConical, Pickaxe, Microscope, ScanLine, Radio, Magnet } from "lucide-react";

export const EQUIPMENT_ICONS = {
  camera: Camera,
  sampler: FlaskConical,
  drill: Pickaxe,
  analyzer: Microscope,
  spectrometer: ScanLine,
  radar: Radio,
  magnetometer: Magnet,
};

export function equipmentIcon(id) {
  return EQUIPMENT_ICONS[id] || Camera;
}