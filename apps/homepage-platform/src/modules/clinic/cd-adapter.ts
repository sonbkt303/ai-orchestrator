import type { CdAdapter } from './cd-adapter.interface';
import { mockCdAdapter } from './cd-adapter.mock';

export function createCdAdapter(): CdAdapter {
  const mode = process.env.CD_ADAPTER ?? 'mock';

  if (mode === 'mock') {
    return mockCdAdapter;
  }

  throw new Error(`Unsupported CD_ADAPTER: ${mode}`);
}

export const cdAdapter = createCdAdapter();
