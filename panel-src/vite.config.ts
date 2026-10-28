import { defineConfig } from 'vitest/config';

/** Builds the panel into the integration folder as one ES module; also configures Vitest. */
export default defineConfig({
  build: {
    target: 'es2022',
    outDir: '../custom_components/hass_test_data_creator/frontend',
    emptyOutDir: true,
    lib: {
      entry: 'src/panel.ts',
      formats: ['es'],
      fileName: () => 'hass-test-data-creator-panel.js',
    },
  },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
