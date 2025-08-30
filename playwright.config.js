import { defineConfig, devices } from '@playwright/test';

const reportConfig = {
  open: process.env.CI ? "never" : "always",
  folderPath: "ortoni-report",
  filename: "index.html",
  title: "CertGema",
  showProject: !true,
  projectName: "CertGema Test Automation Report",
  testType: "e2e",
  authorName: "Larissa Maria",
  base64Image: false,
  stdIO: false,
  preferredTheme: "light"
};
export default defineConfig({
  reporter: [["ortoni-report", reportConfig], ["list"]],
  testDir: './tests',
  timeout: 1 * 10* 3000, /* Tempo máximo que um teste pode rodar. */
  expect: {
    timeout: 10 * 1000, /* Tempo máximo que o expect() deve esperar para a condição ser atendida. */
  },
  fullyParallel: true,/* Rodar testes em paralelo */
  forbidOnly: !!process.env.CI, /* Falhar a build no CI se 'test.only' estiver presente no código */
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,/* Desabilitar paralelismo no CI */
  use: {
    viewport: { width: 1920, height: 1080 },
    trace: 'on-first-retry', /* Coletar trace quando falhar em testes com retry */
    headless: true,  /* Executar testes no modo headless */
    screenshot: 'on',  /* Captura de screenshot em falhas */
    video: 'on', /* Captura video */
  },
  projects: [
    
    // Setup project
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    {
      name: 'portal',
      testMatch: /.*portal\/.*\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
      dependencies: [],
    },
    {
      name: 'api',
      testMatch: /.*api\/.*\.ts/,
      use: {
        viewport: null,      
        screenshot: 'off', 
        video: 'off',      
      },
      dependencies: [],
    },
  ],
});
