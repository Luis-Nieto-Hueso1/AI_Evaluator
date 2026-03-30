const STORAGE_KEY = "llm-eval-calibration";

export interface CalibrationData {
  factor: number;
  modelName: string;
  measuredToks: number;
  estimatedToks: number;
}

export function loadCalibration(): CalibrationData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CalibrationData;
    if (parsed.factor > 0 && parsed.factor < 100) return parsed;
  } catch {}
  return null;
}

export function saveCalibration(data: CalibrationData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function clearCalibration() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
