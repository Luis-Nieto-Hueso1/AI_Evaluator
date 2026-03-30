export interface DetectedHardware {
  ram: number | null;
  vram: number | null;
  gpuName: string | null;
  hasGpu: boolean;
  isAppleSilicon: boolean;
  ramCapped: boolean;
  deviceModel: string | null;
  cpuCores: number | null;
}

export interface CpuOption {
  id: string;
  name: string;
  brand: "Intel" | "AMD";
  series: string;
  cores: number;
  threads: number;
}

export const CPU_LIST: CpuOption[] = [
  // ── Intel 14th Gen ───────────────────────────────────────
  {
    id: "i9-14900k",
    name: "Core i9-14900K",
    brand: "Intel",
    series: "14th Gen",
    cores: 24,
    threads: 32,
  },
  {
    id: "i9-14900kf",
    name: "Core i9-14900KF",
    brand: "Intel",
    series: "14th Gen",
    cores: 24,
    threads: 32,
  },
  {
    id: "i7-14700k",
    name: "Core i7-14700K",
    brand: "Intel",
    series: "14th Gen",
    cores: 20,
    threads: 28,
  },
  {
    id: "i7-14700kf",
    name: "Core i7-14700KF",
    brand: "Intel",
    series: "14th Gen",
    cores: 20,
    threads: 28,
  },
  {
    id: "i5-14600k",
    name: "Core i5-14600K",
    brand: "Intel",
    series: "14th Gen",
    cores: 14,
    threads: 20,
  },
  {
    id: "i5-14600kf",
    name: "Core i5-14600KF",
    brand: "Intel",
    series: "14th Gen",
    cores: 14,
    threads: 20,
  },
  // ── Intel 13th Gen ───────────────────────────────────────
  {
    id: "i9-13900k",
    name: "Core i9-13900K",
    brand: "Intel",
    series: "13th Gen",
    cores: 24,
    threads: 32,
  },
  {
    id: "i9-13900kf",
    name: "Core i9-13900KF",
    brand: "Intel",
    series: "13th Gen",
    cores: 24,
    threads: 32,
  },
  {
    id: "i7-13700k",
    name: "Core i7-13700K",
    brand: "Intel",
    series: "13th Gen",
    cores: 16,
    threads: 24,
  },
  {
    id: "i5-13600k",
    name: "Core i5-13600K",
    brand: "Intel",
    series: "13th Gen",
    cores: 14,
    threads: 20,
  },
  {
    id: "i5-13400",
    name: "Core i5-13400",
    brand: "Intel",
    series: "13th Gen",
    cores: 10,
    threads: 16,
  },
  // ── Intel 12th Gen ───────────────────────────────────────
  {
    id: "i9-12900k",
    name: "Core i9-12900K",
    brand: "Intel",
    series: "12th Gen",
    cores: 16,
    threads: 24,
  },
  {
    id: "i7-12700k",
    name: "Core i7-12700K",
    brand: "Intel",
    series: "12th Gen",
    cores: 12,
    threads: 20,
  },
  {
    id: "i5-12600k",
    name: "Core i5-12600K",
    brand: "Intel",
    series: "12th Gen",
    cores: 10,
    threads: 16,
  },
  {
    id: "i5-12400",
    name: "Core i5-12400",
    brand: "Intel",
    series: "12th Gen",
    cores: 6,
    threads: 12,
  },
  // ── Intel Laptop ─────────────────────────────────────────
  {
    id: "i9-14900hx",
    name: "Core i9-14900HX",
    brand: "Intel",
    series: "14th Gen (laptop)",
    cores: 24,
    threads: 32,
  },
  {
    id: "i7-14700hx",
    name: "Core i7-14700HX",
    brand: "Intel",
    series: "14th Gen (laptop)",
    cores: 20,
    threads: 28,
  },
  {
    id: "i9-13900hx",
    name: "Core i9-13900HX",
    brand: "Intel",
    series: "13th Gen (laptop)",
    cores: 24,
    threads: 32,
  },
  {
    id: "i7-13700h",
    name: "Core i7-13700H",
    brand: "Intel",
    series: "13th Gen (laptop)",
    cores: 14,
    threads: 20,
  },
  {
    id: "i5-13500h",
    name: "Core i5-13500H",
    brand: "Intel",
    series: "13th Gen (laptop)",
    cores: 12,
    threads: 16,
  },
  // ── AMD Ryzen 9000 ────────────────────────────────────────
  {
    id: "r9-9950x",
    name: "Ryzen 9 9950X",
    brand: "AMD",
    series: "9000",
    cores: 16,
    threads: 32,
  },
  {
    id: "r9-9900x",
    name: "Ryzen 9 9900X",
    brand: "AMD",
    series: "9000",
    cores: 12,
    threads: 24,
  },
  {
    id: "r7-9700x",
    name: "Ryzen 7 9700X",
    brand: "AMD",
    series: "9000",
    cores: 8,
    threads: 16,
  },
  {
    id: "r5-9600x",
    name: "Ryzen 5 9600X",
    brand: "AMD",
    series: "9000",
    cores: 6,
    threads: 12,
  },
  // ── AMD Ryzen 7000 ────────────────────────────────────────
  {
    id: "r9-7950x",
    name: "Ryzen 9 7950X",
    brand: "AMD",
    series: "7000",
    cores: 16,
    threads: 32,
  },
  {
    id: "r9-7950x3d",
    name: "Ryzen 9 7950X3D",
    brand: "AMD",
    series: "7000",
    cores: 16,
    threads: 32,
  },
  {
    id: "r9-7900x",
    name: "Ryzen 9 7900X",
    brand: "AMD",
    series: "7000",
    cores: 12,
    threads: 24,
  },
  {
    id: "r7-7800x3d",
    name: "Ryzen 7 7800X3D",
    brand: "AMD",
    series: "7000",
    cores: 8,
    threads: 16,
  },
  {
    id: "r7-7700x",
    name: "Ryzen 7 7700X",
    brand: "AMD",
    series: "7000",
    cores: 8,
    threads: 16,
  },
  {
    id: "r5-7600x",
    name: "Ryzen 5 7600X",
    brand: "AMD",
    series: "7000",
    cores: 6,
    threads: 12,
  },
  {
    id: "r5-7600",
    name: "Ryzen 5 7600",
    brand: "AMD",
    series: "7000",
    cores: 6,
    threads: 12,
  },
  // ── AMD Ryzen 5000 ────────────────────────────────────────
  {
    id: "r9-5950x",
    name: "Ryzen 9 5950X",
    brand: "AMD",
    series: "5000",
    cores: 16,
    threads: 32,
  },
  {
    id: "r9-5900x",
    name: "Ryzen 9 5900X",
    brand: "AMD",
    series: "5000",
    cores: 12,
    threads: 24,
  },
  {
    id: "r7-5800x3d",
    name: "Ryzen 7 5800X3D",
    brand: "AMD",
    series: "5000",
    cores: 8,
    threads: 16,
  },
  {
    id: "r7-5800x",
    name: "Ryzen 7 5800X",
    brand: "AMD",
    series: "5000",
    cores: 8,
    threads: 16,
  },
  {
    id: "r5-5600x",
    name: "Ryzen 5 5600X",
    brand: "AMD",
    series: "5000",
    cores: 6,
    threads: 12,
  },
  {
    id: "r5-5600",
    name: "Ryzen 5 5600",
    brand: "AMD",
    series: "5000",
    cores: 6,
    threads: 12,
  },
  // ── AMD Ryzen Laptop ──────────────────────────────────────
  {
    id: "r9-7945hx",
    name: "Ryzen 9 7945HX",
    brand: "AMD",
    series: "7000 (laptop)",
    cores: 16,
    threads: 32,
  },
  {
    id: "r9-7940hs",
    name: "Ryzen 9 7940HS",
    brand: "AMD",
    series: "7000 (laptop)",
    cores: 8,
    threads: 16,
  },
  {
    id: "r7-7745hx",
    name: "Ryzen 7 7745HX",
    brand: "AMD",
    series: "7000 (laptop)",
    cores: 8,
    threads: 16,
  },
  {
    id: "r7-7735hs",
    name: "Ryzen 7 7735HS",
    brand: "AMD",
    series: "7000 (laptop)",
    cores: 8,
    threads: 16,
  },
  {
    id: "r5-7535hs",
    name: "Ryzen 5 7535HS",
    brand: "AMD",
    series: "7000 (laptop)",
    cores: 6,
    threads: 12,
  },
];

export interface GpuOption {
  id: string;
  name: string;
  brand: "NVIDIA" | "AMD" | "Intel" | "Apple";
  series: string;
  vram: number;
  /** Apple Silicon: unified memory — treat VRAM = RAM */
  unified?: boolean;
}

export const GPU_LIST: GpuOption[] = [
  // ── NVIDIA RTX 50 ────────────────────────────────────────
  {
    id: "rtx-5090",
    name: "RTX 5090",
    brand: "NVIDIA",
    series: "RTX 50",
    vram: 32,
  },
  {
    id: "rtx-5080",
    name: "RTX 5080",
    brand: "NVIDIA",
    series: "RTX 50",
    vram: 16,
  },
  {
    id: "rtx-5070-ti",
    name: "RTX 5070 Ti",
    brand: "NVIDIA",
    series: "RTX 50",
    vram: 16,
  },
  {
    id: "rtx-5070",
    name: "RTX 5070",
    brand: "NVIDIA",
    series: "RTX 50",
    vram: 12,
  },
  {
    id: "rtx-5060-ti",
    name: "RTX 5060 Ti",
    brand: "NVIDIA",
    series: "RTX 50",
    vram: 16,
  },
  {
    id: "rtx-5060",
    name: "RTX 5060",
    brand: "NVIDIA",
    series: "RTX 50",
    vram: 8,
  },
  // ── NVIDIA RTX 40 ────────────────────────────────────────
  {
    id: "rtx-4090",
    name: "RTX 4090",
    brand: "NVIDIA",
    series: "RTX 40",
    vram: 24,
  },
  {
    id: "rtx-4080-super",
    name: "RTX 4080 Super",
    brand: "NVIDIA",
    series: "RTX 40",
    vram: 16,
  },
  {
    id: "rtx-4080",
    name: "RTX 4080",
    brand: "NVIDIA",
    series: "RTX 40",
    vram: 16,
  },
  {
    id: "rtx-4070-ti-super",
    name: "RTX 4070 Ti Super",
    brand: "NVIDIA",
    series: "RTX 40",
    vram: 16,
  },
  {
    id: "rtx-4070-ti",
    name: "RTX 4070 Ti",
    brand: "NVIDIA",
    series: "RTX 40",
    vram: 12,
  },
  {
    id: "rtx-4070-super",
    name: "RTX 4070 Super",
    brand: "NVIDIA",
    series: "RTX 40",
    vram: 12,
  },
  {
    id: "rtx-4070",
    name: "RTX 4070",
    brand: "NVIDIA",
    series: "RTX 40",
    vram: 12,
  },
  {
    id: "rtx-4060-ti-16",
    name: "RTX 4060 Ti 16 GB",
    brand: "NVIDIA",
    series: "RTX 40",
    vram: 16,
  },
  {
    id: "rtx-4060-ti",
    name: "RTX 4060 Ti",
    brand: "NVIDIA",
    series: "RTX 40",
    vram: 8,
  },
  {
    id: "rtx-4060",
    name: "RTX 4060",
    brand: "NVIDIA",
    series: "RTX 40",
    vram: 8,
  },
  {
    id: "rtx-4050",
    name: "RTX 4050 (laptop)",
    brand: "NVIDIA",
    series: "RTX 40",
    vram: 6,
  },
  // ── NVIDIA RTX 30 ────────────────────────────────────────
  {
    id: "rtx-3090-ti",
    name: "RTX 3090 Ti",
    brand: "NVIDIA",
    series: "RTX 30",
    vram: 24,
  },
  {
    id: "rtx-3090",
    name: "RTX 3090",
    brand: "NVIDIA",
    series: "RTX 30",
    vram: 24,
  },
  {
    id: "rtx-3080-ti",
    name: "RTX 3080 Ti",
    brand: "NVIDIA",
    series: "RTX 30",
    vram: 12,
  },
  {
    id: "rtx-3080-12",
    name: "RTX 3080 12 GB",
    brand: "NVIDIA",
    series: "RTX 30",
    vram: 12,
  },
  {
    id: "rtx-3080",
    name: "RTX 3080",
    brand: "NVIDIA",
    series: "RTX 30",
    vram: 10,
  },
  {
    id: "rtx-3070-ti",
    name: "RTX 3070 Ti",
    brand: "NVIDIA",
    series: "RTX 30",
    vram: 8,
  },
  {
    id: "rtx-3070",
    name: "RTX 3070",
    brand: "NVIDIA",
    series: "RTX 30",
    vram: 8,
  },
  {
    id: "rtx-3060-ti",
    name: "RTX 3060 Ti",
    brand: "NVIDIA",
    series: "RTX 30",
    vram: 8,
  },
  {
    id: "rtx-3060-12",
    name: "RTX 3060 12 GB",
    brand: "NVIDIA",
    series: "RTX 30",
    vram: 12,
  },
  {
    id: "rtx-3060",
    name: "RTX 3060",
    brand: "NVIDIA",
    series: "RTX 30",
    vram: 12,
  },
  {
    id: "rtx-3050",
    name: "RTX 3050",
    brand: "NVIDIA",
    series: "RTX 30",
    vram: 8,
  },
  // ── NVIDIA RTX 20 ────────────────────────────────────────
  {
    id: "rtx-2080-ti",
    name: "RTX 2080 Ti",
    brand: "NVIDIA",
    series: "RTX 20",
    vram: 11,
  },
  {
    id: "rtx-2080-super",
    name: "RTX 2080 Super",
    brand: "NVIDIA",
    series: "RTX 20",
    vram: 8,
  },
  {
    id: "rtx-2080",
    name: "RTX 2080",
    brand: "NVIDIA",
    series: "RTX 20",
    vram: 8,
  },
  {
    id: "rtx-2070-super",
    name: "RTX 2070 Super",
    brand: "NVIDIA",
    series: "RTX 20",
    vram: 8,
  },
  {
    id: "rtx-2070",
    name: "RTX 2070",
    brand: "NVIDIA",
    series: "RTX 20",
    vram: 8,
  },
  {
    id: "rtx-2060-super",
    name: "RTX 2060 Super",
    brand: "NVIDIA",
    series: "RTX 20",
    vram: 8,
  },
  {
    id: "rtx-2060",
    name: "RTX 2060",
    brand: "NVIDIA",
    series: "RTX 20",
    vram: 6,
  },
  // ── NVIDIA GTX ───────────────────────────────────────────
  {
    id: "gtx-1660-super",
    name: "GTX 1660 Super",
    brand: "NVIDIA",
    series: "GTX 16",
    vram: 6,
  },
  {
    id: "gtx-1660-ti",
    name: "GTX 1660 Ti",
    brand: "NVIDIA",
    series: "GTX 16",
    vram: 6,
  },
  {
    id: "gtx-1660",
    name: "GTX 1660",
    brand: "NVIDIA",
    series: "GTX 16",
    vram: 6,
  },
  {
    id: "gtx-1650-super",
    name: "GTX 1650 Super",
    brand: "NVIDIA",
    series: "GTX 16",
    vram: 4,
  },
  {
    id: "gtx-1650",
    name: "GTX 1650",
    brand: "NVIDIA",
    series: "GTX 16",
    vram: 4,
  },
  {
    id: "gtx-1080-ti",
    name: "GTX 1080 Ti",
    brand: "NVIDIA",
    series: "GTX 10",
    vram: 11,
  },
  {
    id: "gtx-1080",
    name: "GTX 1080",
    brand: "NVIDIA",
    series: "GTX 10",
    vram: 8,
  },
  {
    id: "gtx-1070-ti",
    name: "GTX 1070 Ti",
    brand: "NVIDIA",
    series: "GTX 10",
    vram: 8,
  },
  {
    id: "gtx-1070",
    name: "GTX 1070",
    brand: "NVIDIA",
    series: "GTX 10",
    vram: 8,
  },
  {
    id: "gtx-1060-6",
    name: "GTX 1060 6 GB",
    brand: "NVIDIA",
    series: "GTX 10",
    vram: 6,
  },
  {
    id: "gtx-1060-3",
    name: "GTX 1060 3 GB",
    brand: "NVIDIA",
    series: "GTX 10",
    vram: 3,
  },
  {
    id: "gtx-1050-ti",
    name: "GTX 1050 Ti",
    brand: "NVIDIA",
    series: "GTX 10",
    vram: 4,
  },
  {
    id: "gtx-1050",
    name: "GTX 1050",
    brand: "NVIDIA",
    series: "GTX 10",
    vram: 4,
  },
  // ── AMD RX 7000 ──────────────────────────────────────────
  {
    id: "rx-7900-xtx",
    name: "RX 7900 XTX",
    brand: "AMD",
    series: "RX 7000",
    vram: 24,
  },
  {
    id: "rx-7900-xt",
    name: "RX 7900 XT",
    brand: "AMD",
    series: "RX 7000",
    vram: 20,
  },
  {
    id: "rx-7900-gre",
    name: "RX 7900 GRE",
    brand: "AMD",
    series: "RX 7000",
    vram: 16,
  },
  {
    id: "rx-7800-xt",
    name: "RX 7800 XT",
    brand: "AMD",
    series: "RX 7000",
    vram: 16,
  },
  {
    id: "rx-7700-xt",
    name: "RX 7700 XT",
    brand: "AMD",
    series: "RX 7000",
    vram: 12,
  },
  {
    id: "rx-7600-xt",
    name: "RX 7600 XT",
    brand: "AMD",
    series: "RX 7000",
    vram: 16,
  },
  { id: "rx-7600", name: "RX 7600", brand: "AMD", series: "RX 7000", vram: 8 },
  // ── AMD RX 6000 ──────────────────────────────────────────
  {
    id: "rx-6950-xt",
    name: "RX 6950 XT",
    brand: "AMD",
    series: "RX 6000",
    vram: 16,
  },
  {
    id: "rx-6900-xt",
    name: "RX 6900 XT",
    brand: "AMD",
    series: "RX 6000",
    vram: 16,
  },
  {
    id: "rx-6800-xt",
    name: "RX 6800 XT",
    brand: "AMD",
    series: "RX 6000",
    vram: 16,
  },
  { id: "rx-6800", name: "RX 6800", brand: "AMD", series: "RX 6000", vram: 16 },
  {
    id: "rx-6750-xt",
    name: "RX 6750 XT",
    brand: "AMD",
    series: "RX 6000",
    vram: 12,
  },
  {
    id: "rx-6700-xt",
    name: "RX 6700 XT",
    brand: "AMD",
    series: "RX 6000",
    vram: 12,
  },
  { id: "rx-6700", name: "RX 6700", brand: "AMD", series: "RX 6000", vram: 10 },
  {
    id: "rx-6650-xt",
    name: "RX 6650 XT",
    brand: "AMD",
    series: "RX 6000",
    vram: 8,
  },
  {
    id: "rx-6600-xt",
    name: "RX 6600 XT",
    brand: "AMD",
    series: "RX 6000",
    vram: 8,
  },
  { id: "rx-6600", name: "RX 6600", brand: "AMD", series: "RX 6000", vram: 8 },
  {
    id: "rx-6500-xt",
    name: "RX 6500 XT",
    brand: "AMD",
    series: "RX 6000",
    vram: 4,
  },
  // ── AMD RX 5000 ──────────────────────────────────────────
  {
    id: "rx-5700-xt",
    name: "RX 5700 XT",
    brand: "AMD",
    series: "RX 5000",
    vram: 8,
  },
  { id: "rx-5700", name: "RX 5700", brand: "AMD", series: "RX 5000", vram: 8 },
  {
    id: "rx-5600-xt",
    name: "RX 5600 XT",
    brand: "AMD",
    series: "RX 5000",
    vram: 6,
  },
  {
    id: "rx-5500-xt",
    name: "RX 5500 XT",
    brand: "AMD",
    series: "RX 5000",
    vram: 8,
  },
  // ── Intel Arc ────────────────────────────────────────────
  {
    id: "arc-a770",
    name: "Arc A770",
    brand: "Intel",
    series: "Arc A",
    vram: 16,
  },
  {
    id: "arc-a750",
    name: "Arc A750",
    brand: "Intel",
    series: "Arc A",
    vram: 8,
  },
  {
    id: "arc-a580",
    name: "Arc A580",
    brand: "Intel",
    series: "Arc A",
    vram: 8,
  },
  {
    id: "arc-a380",
    name: "Arc A380",
    brand: "Intel",
    series: "Arc A",
    vram: 6,
  },
  {
    id: "arc-a310",
    name: "Arc A310",
    brand: "Intel",
    series: "Arc A",
    vram: 4,
  },
  // ── Apple Silicon (unified memory) ───────────────────────
  {
    id: "m4-max-48",
    name: "Apple M4 Max 48 GB",
    brand: "Apple",
    series: "M4",
    vram: 48,
    unified: true,
  },
  {
    id: "m4-max-36",
    name: "Apple M4 Max 36 GB",
    brand: "Apple",
    series: "M4",
    vram: 36,
    unified: true,
  },
  {
    id: "m4-pro-24",
    name: "Apple M4 Pro 24 GB",
    brand: "Apple",
    series: "M4",
    vram: 24,
    unified: true,
  },
  {
    id: "m4-pro-16",
    name: "Apple M4 Pro 16 GB",
    brand: "Apple",
    series: "M4",
    vram: 16,
    unified: true,
  },
  {
    id: "m4-16",
    name: "Apple M4 16 GB",
    brand: "Apple",
    series: "M4",
    vram: 16,
    unified: true,
  },
  {
    id: "m4-base",
    name: "Apple M4 (base)",
    brand: "Apple",
    series: "M4",
    vram: 16,
    unified: true,
  },
  {
    id: "m3-max-64",
    name: "Apple M3 Max 64 GB",
    brand: "Apple",
    series: "M3",
    vram: 64,
    unified: true,
  },
  {
    id: "m3-max-36",
    name: "Apple M3 Max 36 GB",
    brand: "Apple",
    series: "M3",
    vram: 36,
    unified: true,
  },
  {
    id: "m3-pro-36",
    name: "Apple M3 Pro 36 GB",
    brand: "Apple",
    series: "M3",
    vram: 36,
    unified: true,
  },
  {
    id: "m3-pro-18",
    name: "Apple M3 Pro 18 GB",
    brand: "Apple",
    series: "M3",
    vram: 18,
    unified: true,
  },
  {
    id: "m3-24",
    name: "Apple M3 24 GB",
    brand: "Apple",
    series: "M3",
    vram: 24,
    unified: true,
  },
  {
    id: "m3-16",
    name: "Apple M3 16 GB",
    brand: "Apple",
    series: "M3",
    vram: 16,
    unified: true,
  },
  {
    id: "m3-8",
    name: "Apple M3 8 GB",
    brand: "Apple",
    series: "M3",
    vram: 8,
    unified: true,
  },
  {
    id: "m2-ultra-192",
    name: "Apple M2 Ultra 192 GB",
    brand: "Apple",
    series: "M2",
    vram: 192,
    unified: true,
  },
  {
    id: "m2-ultra-64",
    name: "Apple M2 Ultra 64 GB",
    brand: "Apple",
    series: "M2",
    vram: 64,
    unified: true,
  },
  {
    id: "m2-max-96",
    name: "Apple M2 Max 96 GB",
    brand: "Apple",
    series: "M2",
    vram: 96,
    unified: true,
  },
  {
    id: "m2-max-64",
    name: "Apple M2 Max 64 GB",
    brand: "Apple",
    series: "M2",
    vram: 64,
    unified: true,
  },
  {
    id: "m2-max-32",
    name: "Apple M2 Max 32 GB",
    brand: "Apple",
    series: "M2",
    vram: 32,
    unified: true,
  },
  {
    id: "m2-pro-32",
    name: "Apple M2 Pro 32 GB",
    brand: "Apple",
    series: "M2",
    vram: 32,
    unified: true,
  },
  {
    id: "m2-pro-16",
    name: "Apple M2 Pro 16 GB",
    brand: "Apple",
    series: "M2",
    vram: 16,
    unified: true,
  },
  {
    id: "m2-24",
    name: "Apple M2 24 GB",
    brand: "Apple",
    series: "M2",
    vram: 24,
    unified: true,
  },
  {
    id: "m2-16",
    name: "Apple M2 16 GB",
    brand: "Apple",
    series: "M2",
    vram: 16,
    unified: true,
  },
  {
    id: "m2-8",
    name: "Apple M2 8 GB",
    brand: "Apple",
    series: "M2",
    vram: 8,
    unified: true,
  },
  {
    id: "m1-ultra-128",
    name: "Apple M1 Ultra 128 GB",
    brand: "Apple",
    series: "M1",
    vram: 128,
    unified: true,
  },
  {
    id: "m1-ultra-64",
    name: "Apple M1 Ultra 64 GB",
    brand: "Apple",
    series: "M1",
    vram: 64,
    unified: true,
  },
  {
    id: "m1-max-64",
    name: "Apple M1 Max 64 GB",
    brand: "Apple",
    series: "M1",
    vram: 64,
    unified: true,
  },
  {
    id: "m1-max-32",
    name: "Apple M1 Max 32 GB",
    brand: "Apple",
    series: "M1",
    vram: 32,
    unified: true,
  },
  {
    id: "m1-pro-32",
    name: "Apple M1 Pro 32 GB",
    brand: "Apple",
    series: "M1",
    vram: 32,
    unified: true,
  },
  {
    id: "m1-pro-16",
    name: "Apple M1 Pro 16 GB",
    brand: "Apple",
    series: "M1",
    vram: 16,
    unified: true,
  },
  {
    id: "m1-16",
    name: "Apple M1 16 GB",
    brand: "Apple",
    series: "M1",
    vram: 16,
    unified: true,
  },
  {
    id: "m1-8",
    name: "Apple M1 8 GB",
    brand: "Apple",
    series: "M1",
    vram: 8,
    unified: true,
  },
];

/** Memory bandwidth in GB/s — used to estimate tokens/second */
export const GPU_BANDWIDTH: Record<string, number> = {
  // NVIDIA RTX 50
  "rtx-5090": 1792,
  "rtx-5080": 960,
  "rtx-5070-ti": 896,
  "rtx-5070": 672,
  "rtx-5060-ti": 608,
  "rtx-5060": 448,
  // NVIDIA RTX 40
  "rtx-4090": 1008,
  "rtx-4080-super": 736,
  "rtx-4080": 717,
  "rtx-4070-ti-super": 672,
  "rtx-4070-ti": 504,
  "rtx-4070-super": 504,
  "rtx-4070": 504,
  "rtx-4060-ti-16": 288,
  "rtx-4060-ti": 288,
  "rtx-4060": 272,
  "rtx-4050": 192,
  // NVIDIA RTX 30
  "rtx-3090-ti": 1008,
  "rtx-3090": 936,
  "rtx-3080-ti": 912,
  "rtx-3080-12": 912,
  "rtx-3080": 760,
  "rtx-3070-ti": 608,
  "rtx-3070": 448,
  "rtx-3060-ti": 448,
  "rtx-3060-12": 360,
  "rtx-3060": 360,
  "rtx-3050": 224,
  // NVIDIA RTX 20
  "rtx-2080-ti": 616,
  "rtx-2080-super": 496,
  "rtx-2080": 448,
  "rtx-2070-super": 448,
  "rtx-2070": 448,
  "rtx-2060-super": 448,
  "rtx-2060": 336,
  // NVIDIA GTX 16
  "gtx-1660-super": 336,
  "gtx-1660-ti": 288,
  "gtx-1660": 192,
  "gtx-1650-super": 192,
  "gtx-1650": 128,
  // NVIDIA GTX 10
  "gtx-1080-ti": 484,
  "gtx-1080": 320,
  "gtx-1070-ti": 256,
  "gtx-1070": 256,
  "gtx-1060-6": 192,
  "gtx-1060-3": 192,
  "gtx-1050-ti": 112,
  "gtx-1050": 112,
  // AMD RX 7000
  "rx-7900-xtx": 960,
  "rx-7900-xt": 800,
  "rx-7900-gre": 576,
  "rx-7800-xt": 624,
  "rx-7700-xt": 432,
  "rx-7600-xt": 288,
  "rx-7600": 288,
  // AMD RX 6000
  "rx-6950-xt": 576,
  "rx-6900-xt": 512,
  "rx-6800-xt": 512,
  "rx-6800": 512,
  "rx-6750-xt": 432,
  "rx-6700-xt": 384,
  "rx-6700": 320,
  "rx-6650-xt": 280,
  "rx-6600-xt": 256,
  "rx-6600": 224,
  "rx-6500-xt": 144,
  // AMD RX 5000
  "rx-5700-xt": 448,
  "rx-5700": 448,
  "rx-5600-xt": 336,
  "rx-5500-xt": 224,
  // Intel Arc
  "arc-a770": 560,
  "arc-a750": 512,
  "arc-a580": 512,
  "arc-a380": 186,
  "arc-a310": 128,
  // Apple Silicon unified memory bandwidth
  "m4-max-48": 546,
  "m4-max-36": 546,
  "m4-pro-24": 273,
  "m4-pro-16": 273,
  "m4-16": 120,
  "m4-base": 120,
  "m3-max-64": 400,
  "m3-max-36": 400,
  "m3-pro-36": 150,
  "m3-pro-18": 150,
  "m3-24": 100,
  "m3-16": 100,
  "m3-8": 100,
  "m2-ultra-192": 800,
  "m2-ultra-64": 800,
  "m2-max-96": 400,
  "m2-max-64": 400,
  "m2-max-32": 400,
  "m2-pro-32": 200,
  "m2-pro-16": 200,
  "m2-24": 100,
  "m2-16": 100,
  "m2-8": 100,
  "m1-ultra-128": 800,
  "m1-ultra-64": 800,
  "m1-max-64": 400,
  "m1-max-32": 400,
  "m1-pro-32": 200,
  "m1-pro-16": 200,
  "m1-16": 68,
  "m1-8": 68,
};

// Internal lookup used during auto-detection
// Order matters: more specific strings must come before less specific ones
const GPU_VRAM_TABLE: Array<[string, number]> = [
  // RTX 50 series
  ["5090", 32],
  ["5080", 16],
  ["5070 ti", 16],
  ["5070", 12],
  ["5060 ti", 16],
  ["5060", 8],
  // RTX 40 series
  ["4090", 24],
  ["4080 super", 16],
  ["4080", 16],
  ["4070 ti super", 16],
  ["4070 ti", 12],
  ["4070 super", 12],
  ["4070", 12],
  ["4060 ti 16gb", 16],
  ["4060 ti", 8],
  ["4060", 8],
  ["4050", 6],
  ["3090 ti", 24],
  ["3090", 24],
  ["3080 ti", 12],
  ["3080 12gb", 12],
  ["3080", 10],
  ["3070 ti", 8],
  ["3070", 8],
  ["3060 ti", 8],
  ["3060 12gb", 12],
  ["3060", 12],
  ["3050", 8],
  ["2080 ti", 11],
  ["2080 super", 8],
  ["2080", 8],
  ["2070 super", 8],
  ["2070", 8],
  ["2060 super", 8],
  ["2060", 6],
  ["1660 super", 6],
  ["1660 ti", 6],
  ["1660", 6],
  ["1650 super", 4],
  ["1650", 4],
  ["1080 ti", 11],
  ["1080", 8],
  ["1070 ti", 8],
  ["1070", 8],
  ["1060 6gb", 6],
  ["1060 3gb", 3],
  ["1060", 6],
  ["1050 ti", 4],
  ["1050", 4],
  ["rx 7900 xtx", 24],
  ["rx 7900 xt", 20],
  ["rx 7900 gre", 16],
  ["rx 7800 xt", 16],
  ["rx 7700 xt", 12],
  ["rx 7600 xt", 16],
  ["rx 7600", 8],
  ["rx 6950 xt", 16],
  ["rx 6900 xt", 16],
  ["rx 6800 xt", 16],
  ["rx 6800", 16],
  ["rx 6750 xt", 12],
  ["rx 6700 xt", 12],
  ["rx 6700", 10],
  ["rx 6650 xt", 8],
  ["rx 6600 xt", 8],
  ["rx 6600", 8],
  ["rx 6500 xt", 4],
  ["rx 5700 xt", 8],
  ["rx 5700", 8],
  ["rx 5600 xt", 6],
  ["rx 5500 xt", 8],
  ["arc a770", 16],
  ["arc a750", 8],
  ["arc a580", 8],
  ["arc a380", 6],
  ["arc a310", 4],
];

function getGpuVram(rendererString: string): number | null {
  const lower = rendererString.toLowerCase();
  for (const [key, vram] of GPU_VRAM_TABLE) {
    if (lower.includes(key)) return vram;
  }
  return null;
}

function getWebGLRenderer(): string | null {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return null;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return null;
    return (gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string) || null;
  } catch {
    return null;
  }
}

function detectDeviceModel(
  renderer: string,
  isAppleSilicon: boolean,
  cpuCores: number | null,
): string | null {
  const ua = navigator.userAgent;
  const coresStr = cpuCores ? ` · ${cpuCores} cores` : "";

  if (isAppleSilicon) {
    const match = renderer.match(/apple m\d(?:\s+(?:ultra|max|pro))?/i);
    return match ? match[0] : `Apple Silicon${coresStr}`;
  }

  if (/Macintosh|MacIntel/i.test(ua)) return `Intel Mac${coresStr}`;
  if (/Win64|Win32|WOW64|Windows/i.test(ua)) return `Windows PC${coresStr}`;
  if (/Linux/i.test(ua)) return `Linux PC${coresStr}`;
  if (/Android/i.test(ua)) return `Android${coresStr}`;
  if (/iPad|iPhone|iPod/i.test(ua)) return `iOS Device`;

  return null;
}

/**
 * Strips WebGL ANGLE wrapper and technical suffixes from raw renderer strings.
 * "ANGLE (Intel, Intel(R) Iris(R) Xe Graphics (0x0000A7A1) Direct3D11 vs_5_0 ps_5_0, D3D11)"
 * → "Intel Iris Xe Graphics"
 */
function cleanGpuName(raw: string): string {
  let name = raw;
  // Extract inner renderer from ANGLE (vendor, renderer, backend)
  const angleMatch = raw.match(/^ANGLE \([^,]+,\s*(.+),\s*[^,]+$/);
  if (angleMatch) name = angleMatch[1];
  return name
    .replace(/\(0x[0-9A-Fa-f]+\)/g, "") // hex device IDs
    .replace(/\(R\)/gi, "") // trademark (R)
    .replace(/\(TM\)/gi, "") // trademark (TM)
    .replace(/Direct3D\S*/gi, "") // Direct3D11 etc
    .replace(/vs_\d+_\d+/gi, "") // shader versions
    .replace(/ps_\d+_\d+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectHardware(): DetectedHardware {
  const deviceMemory = (navigator as unknown as { deviceMemory?: number })
    .deviceMemory;
  const ram = deviceMemory ?? null;
  const ramCapped = ram === 8;
  const cpuCores = navigator.hardwareConcurrency ?? null;

  const rendererRaw = getWebGLRenderer();
  const renderer = rendererRaw ?? "";

  const isAppleSilicon =
    /apple m\d/i.test(renderer) ||
    (/apple/i.test(renderer) &&
      /mac/i.test(navigator.userAgent) &&
      !/(intel|amd)/i.test(renderer));

  const deviceModel = detectDeviceModel(renderer, isAppleSilicon, cpuCores);

  const cleanedRenderer = renderer ? cleanGpuName(renderer) : null;

  if (isAppleSilicon) {
    return {
      ram,
      vram: null,
      gpuName: cleanedRenderer,
      hasGpu: false,
      isAppleSilicon: true,
      ramCapped,
      deviceModel,
      cpuCores,
    };
  }

  const vram = renderer ? getGpuVram(renderer) : null;
  return {
    ram,
    vram,
    gpuName: cleanedRenderer,
    hasGpu: vram !== null,
    isAppleSilicon: false,
    ramCapped,
    deviceModel,
    cpuCores,
  };
}

/** Estimated RAM bandwidth in GB/s based on CPU generation (dual-channel) */
export function getCpuBandwidth(cpu: CpuOption): number {
  const map: Record<string, number> = {
    "14th Gen": 77,
    "13th Gen": 77,
    "12th Gen": 51,
    "14th Gen (laptop)": 68,
    "13th Gen (laptop)": 51,
    "9000": 83,
    "7000": 83,
    "5000": 51,
    "7000 (laptop)": 68,
  };
  return map[cpu.series] ?? 51;
}

/**
 * Async GPU detection using the WebGPU API (Chrome 113+, Edge 113+).
 * Returns a more accurate GPU name than WebGL in browsers that anonymize renderer strings.
 * Falls back to null if WebGPU is unavailable.
 */
export async function detectGpuAsync(): Promise<{
  gpuName: string | null;
  vram: number | null;
}> {
  try {
    const nav = navigator as Navigator & {
      gpu?: {
        requestAdapter(): Promise<{
          info?: { device?: string; description?: string };
          requestAdapterInfo?: () => Promise<{
            device?: string;
            description?: string;
          }>;
        } | null>;
      };
    };
    if (!nav.gpu) return { gpuName: null, vram: null };

    const adapter = await nav.gpu.requestAdapter();
    if (!adapter) return { gpuName: null, vram: null };

    // requestAdapterInfo() is available in Chrome 121+
    let gpuName: string | null = null;
    if (
      typeof (
        adapter as {
          requestAdapterInfo?: () => Promise<{
            description?: string;
            device?: string;
          }>;
        }
      ).requestAdapterInfo === "function"
    ) {
      const info = await (
        adapter as {
          requestAdapterInfo: () => Promise<{
            description?: string;
            device?: string;
          }>;
        }
      ).requestAdapterInfo();
      gpuName = info?.description || info?.device || null;
    }

    // Fallback: try adapter.name (non-standard, exists in some runtimes)
    if (!gpuName) {
      gpuName = (adapter as { name?: string }).name ?? null;
    }

    const vram = gpuName ? getGpuVram(gpuName) : null;
    return { gpuName, vram };
  } catch {
    return { gpuName: null, vram: null };
  }
}
