export interface Config {
  width: number;
  height: number;
  rate: number;
}

const KEY = 'mineSweeperConfig';

export function persistConfig(config: Config) {
  localStorage.setItem(KEY, JSON.stringify(config));
}

export function unpersistConfig(defaultConfig: Config): Config {
  const config = {...defaultConfig};

  let raw: any;
  try {
    raw = JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch (e) {}

  if (raw != null) {
    const width = Math.floor(parseInt(String(raw.width), 10));
    const height = Math.floor(parseInt(String(raw.height), 10));
    const rate = parseFloat(String(raw.rate));

    if (width > 0) config.width = width;
    if (height > 0) config.height = height;
    if (!Number.isNaN(rate)) config.rate = Math.max(0, Math.min(1, rate));
  }

  return config;
}
