import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import {validCredentials} from '../../utils';

// Constantes centralizadas
const baseURL = 'http://localhost:4200/';
const LOGIN_URL = `${baseURL}login`;
const WELCOME_URL = `${baseURL}welcome`;

// Credenciais de teste


// Verificar se o projeto está rodando
test('CA00 - Verificar se projeto está rodando', async ({ page }) => {
  await page.goto(baseURL);
  await expect(page).toHaveTitle(/CertGem/);
});

// Verificar navegação para tela de login
test('CA00B - Tela de login funcionando via navegação', async ({ page }) => {
  await page.goto(baseURL);
  await page.getByRole('link', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/login(\?.*)?$/);
});

test('CA01 - Login com credenciais válidas', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navegarPara();
  await loginPage.realizarLogin(validCredentials.email, validCredentials.password);
  await expect(page).toHaveURL(WELCOME_URL);
  
  // Salva estado de autenticação para outros testes se necessário
  await page.context().storageState({ path: 'auth.json' });
});

test('CA02 - Login com credenciais inválidas', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navegarPara();
  await loginPage.realizarLogin('zelezin@gmail.com', 'senhaincorreta123');
  await loginPage.verificarMensagemErro('Erro no login Email ou senha incorretos. Tente novamente.');
  await expect(page).toHaveURL(LOGIN_URL);
});

test('CA03 - Login com e-mail em formato inválido', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navegarPara();
  await loginPage.realizarLogin('usuario@', 'senha123');
  await loginPage.verificarMensagemErro('Email não é válido');
  await expect(page).toHaveURL(LOGIN_URL);
});

test('CA04 - Login com campo de e-mail vazio', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navegarPara();
  await loginPage.preencherSenha('senha123');
  await loginPage.clicarEntrar();
  await loginPage.verificarMensagemErro('Email é obrigatório');
});

test('CA05 - Login com campo de senha vazio', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navegarPara();
  await loginPage.preencherEmail('teste@exemplo.com');
  await loginPage.clicarEntrar();
  await loginPage.verificarValidacaoSenhaObrigatoria();
});

test('CA06 - Login com ambos os campos vazios', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navegarPara();
  await loginPage.clicarEntrar();
  await loginPage.verificarValidacaoCamposVazios();
  await expect(page).toHaveURL(LOGIN_URL);
});

test('CA07 - Login com campos contendo apenas espaços', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navegarPara();
  await loginPage.realizarLogin('   ', '   ');
  await loginPage.verificarValidacaoEspacos();
  await expect(page).toHaveURL(LOGIN_URL);
});

test('CA08 - Login com e-mail válido e senha incorreta', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navegarPara();
  await loginPage.realizarLogin(validCredentials.email, 'senhaerrada123');
  await loginPage.verificarMensagemErroCredenciais();
  await expect(page).toHaveURL(LOGIN_URL);
});

test('CA09 - Validação case-sensitive de e-mail', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navegarPara();
  
  // Login com variação de maiúsculas/minúsculas
  await loginPage.realizarLogin('LMRS@DISCENTE.IFPE.EDU.BR', validCredentials.password);
  await page.waitForLoadState('networkidle');
  
  // Sistema deve rejeitar case-sensitive
  await expect(page).toHaveURL(LOGIN_URL);
});

test('CA10 - Login com caracteres especiais no e-mail', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navegarPara();
  await loginPage.realizarLogin('user@test@exemplo.com', 'senha123');
  
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(LOGIN_URL);
  await loginPage.verificarMensagemErro('Email não é válido');
});

test('CA11 - Tentativa de SQL Injection no campo e-mail', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navegarPara();
  await loginPage.realizarLogin("admin'; DROP TABLE users; --", 'senha123');
  
  // Sistema deve sanitizar entrada e não permitir SQL injection
  await expect(page).toHaveURL(LOGIN_URL);
  
  // Verifica que não houve redirecionamento para welcome (sistema rejeitou)
  await page.waitForLoadState('networkidle');
  const currentUrl = page.url();
  expect(currentUrl).toContain('/login');
  expect(currentUrl).not.toContain('/welcome');
});

test('CA12 - Verificação de redirecionamento após login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navegarPara();
  await loginPage.realizarLogin(validCredentials.email, validCredentials.password);
  
  await page.waitForURL(WELCOME_URL, { timeout: 10000 });
  await expect(page).toHaveURL(WELCOME_URL);
  
  // Verificação adicional da URL
  const currentUrl = await loginPage.verificarURLAtual();
  expect(currentUrl).not.toContain('/login');
  expect(currentUrl).toContain('/welcome');
});

test('CA13 - Persistência de estado após logout e novo login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  // Primeiro login
  await loginPage.navegarPara();
  await loginPage.realizarLogin(validCredentials.email, validCredentials.password);
  await expect(page).toHaveURL(WELCOME_URL);
  
  // Logout usando método da LoginPage
  await loginPage.realizarLogout();
  
  // Segundo login
  await loginPage.navegarPara();
  await loginPage.realizarLogin(validCredentials.email, validCredentials.password);
  await expect(page).toHaveURL(WELCOME_URL);
});

// Verificar comportamento com múltiplas tentativas de login inválido
test('CA14 - Múltiplas tentativas de login inválido', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navegarPara();
  
  // Primeira tentativa com credenciais inválidas
  await loginPage.realizarLogin('teste@exemplo.com', 'senhaerrada1');
  await expect(page).toHaveURL(LOGIN_URL);
  
  // Segunda tentativa com outras credenciais inválidas
  await loginPage.realizarLogin('usuario@teste.com', 'senhaerrada2');
  await expect(page).toHaveURL(LOGIN_URL);
  
  // Terceira tentativa com mais credenciais inválidas
  await loginPage.realizarLogin('admin@fake.com', 'senha123456');
  await expect(page).toHaveURL(LOGIN_URL);
  
  // Verifica que o sistema continua rejeitando e permanece na tela de login
  await page.waitForLoadState('networkidle');
  const currentUrl = page.url();
  expect(currentUrl).toContain('/login');
  expect(currentUrl).not.toContain('/welcome');
  
  // Verifica que os campos ainda estão acessíveis para nova tentativa
  await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Senha' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
});

// Novo teste: Verificar campos obrigatórios com foco e blur
test('CA15 - Validação de campos com foco e blur', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navegarPara();
  
  // Testar foco no campo email e sair sem preencher
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Senha' }).click(); // blur do email
  
  // Testar foco no campo senha e sair sem preencher
  await page.getByRole('textbox', { name: 'Email' }).click(); // blur da senha
  
  // Verificar se aparecem mensagens de validação
  await loginPage.clicarEntrar();
  await loginPage.verificarValidacaoCamposVazios();
});


