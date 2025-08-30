import { test, expect } from '@playwright/test';
import { GemologosPage } from '../../pages/GemologosPage';
import { LoginPage } from '../../pages/LoginPage';
import {validCredentials} from '../../utils';
// Constantes centralizadas
const baseURL = 'http://localhost:4200/';
const WELCOME_URL = `${baseURL}welcome`;
const GEMOLOGOS_URL = `${baseURL}buscar-gemologos`;


test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.navegarPara();
  await loginPage.realizarLogin(validCredentials.email, validCredentials.password);
  
  await expect(page).toHaveURL(WELCOME_URL);
  
  await page.context().storageState({ path: 'auth.json' });
});

// Testar carregamento bem-sucedido da página de gemólogos
test('VG01 - Gemólogos carregados com sucesso', async ({ page }) => {
  const gemologosPage = new GemologosPage(page);
  await gemologosPage.navegarPara();
  
  await gemologosPage.aguardarCarregamento();
  await expect(page).toHaveURL(GEMOLOGOS_URL);
  
  await expect(gemologosPage.tituloPagina).toBeVisible();
  await gemologosPage.verificarGemologosCarregados();
});

// Testar exibição da mensagem de sucesso após carregamento
test('VG02 - Verificar mensagem de sucesso', async ({ page }) => {
  const gemologosPage = new GemologosPage(page);
  await gemologosPage.navegarPara();

  await gemologosPage.verificarMensagemDeSucessoVisivel();
});

// Testar se múltiplos gemólogos são exibidos
test('VG03 - Múltiplos gemólogos visíveis', async ({ page }) => {
  const gemologosPage = new GemologosPage(page);
  await gemologosPage.navegarPara();
  
  await gemologosPage.aguardarCarregamento();
  
  const count = await gemologosPage.cardGemologo.count();
  expect(count).toBeGreaterThan(1); 
});

test('VG04 - Indicador de carregamento durante a busca', async ({ page }) => {
  const gemologosPage = new GemologosPage(page);

  await page.route('**/usuario/gemologos', async route => {
    await gemologosPage.verificarVisibilidadeIndicadorCarregamento(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    route.continue();
  });

  await gemologosPage.navegarPara();
  await gemologosPage.aguardarCarregamento();

  await gemologosPage.verificarVisibilidadeIndicadorCarregamento(false);
});

// Testar tratamento de erro ao carregar lista de gemólogos
test('VG05 - Tratamento de erro na API', async ({ page }) => {
  const gemologosPage = new GemologosPage(page);
  
  await page.route('**/usuario/gemologos', route => {
    route.abort(); 
  });
  
  await gemologosPage.navegarPara();
  
  await gemologosPage.verificarMensagemDeErroVisivel();

  await expect(gemologosPage.listaGemologos).not.toBeVisible();
});
