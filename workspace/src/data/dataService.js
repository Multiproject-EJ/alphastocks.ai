import { getRuntimeConfig } from '../config/runtimeConfig.js';
import { createDemoProvider } from './providers/demoProvider.js';
import { createSupabaseProvider } from './providers/supabaseProvider.js';

let dataServiceInstance;

const createProvider = () => {
  const runtime = getRuntimeConfig();

  if (runtime.isDemoMode) {
    return createDemoProvider();
  }

  return createSupabaseProvider();
};

export const getDataService = () => {
  if (!dataServiceInstance) {
    dataServiceInstance = createProvider();
  }

  return dataServiceInstance;
};

export const resetDataService = () => {
  dataServiceInstance = undefined;
};
