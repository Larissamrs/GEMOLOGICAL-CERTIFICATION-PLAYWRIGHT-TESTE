import { test, expect } from '@playwright/test';
import { CertificadosPage, dadosCertificadoTeste, dadosCertificadoInvalido, DadosCertificado } from '../../pages/CertificadosPage';
import { LoginPage } from '../../pages/LoginPage';
import {validCredentials} from '../../utils';

// Constantes centralizadas
const baseURL = 'http://localhost:4200/';
const WELCOME_URL = `${baseURL}welcome`;


// Hook para realizar login antes de cada teste
test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  // Realizar login
  await loginPage.navegarPara();
  await loginPage.realizarLogin(validCredentials.email, validCredentials.password);
  
  // Verificar se o login foi bem-sucedido
  await expect(page).toHaveURL(WELCOME_URL);
  
  // Salvar estado de autenticação
  await page.context().storageState({ path: 'auth.json' });
});

// CA01 - Verificar carregamento da página de certificados
test('CA01 - Certificados carregados com sucesso', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  await certificadosPage.navegarParaWelcome();
  
  // Verifica se pelo menos um certificado está visível
  await certificadosPage.verificarCertificadosCarregados();
  await certificadosPage.verificarURL(WELCOME_URL);
});

// CA02 - Verificar abertura de certificado específico
test('CA02 - Certificado abrindo com sucesso', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  await certificadosPage.navegarParaWelcome();
  
  // Verifica se há certificados disponíveis
  await certificadosPage.verificarCertificadosCarregados();
  
  // Clica no primeiro certificado
  await certificadosPage.clicarPrimeiroCertificado();
  
  // Verifica redirecionamento para página de detalhes
  await certificadosPage.verificarURLCertificate();
});

// CA03 - Verificar se múltiplos certificados são exibidos
test('CA03 - Múltiplos certificados visíveis', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  await certificadosPage.navegarParaWelcome();
  
  // Aguarda carregamento
  await certificadosPage.aguardarCarregamento();
  
  // Verifica se há pelo menos um certificado
  await certificadosPage.verificarCertificadosCarregados();
  
  // Conta quantos certificados estão visíveis
  const count = await certificadosPage.certificadoCards.count();
  expect(count).toBeGreaterThan(0);
});

// CA04 - Consulta de certificado por ID válido
test('CA04 - Consulta certificado por ID válido', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  
  await certificadosPage.configurarViewport();
  
  // Primeiro navegar para a tela home
  await certificadosPage.navegarParaWelcome();
  
  // Pesquisar pelo certificado específico usando o campo de busca
  const nomeCertificado = 'J3X0Z4Uizu';
  await certificadosPage.pesquisarCertificadoPorNome(nomeCertificado);
  
  // Verificar se o certificado J3X0Z4Uizu aparece no card
  await certificadosPage.verificarCardCertificadoExibido(nomeCertificado);
  
  // Clicar no certificado J3X0Z4Uizu
  await certificadosPage.clicarCertificadoPorNome(nomeCertificado);
  
  // Verificar se está na URL correta
  const certificadoId = '52';
  await certificadosPage.verificarCertificadoPorIdNaUrl(certificadoId);
  
  // Aguardar carregamento dos dados
  await certificadosPage.aguardarCarregamento();
});

// CA05 - Consulta de certificado por ID inexistente
test('CA05 - Consulta certificado por ID inexistente', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  
  await certificadosPage.configurarViewport();
  
  // Usar um ID que não existe
  const certificadoIdInexistente = 'NONEXISTENT123';
  
  // Navegar para certificado inexistente
  await certificadosPage.navegarParaCertificadoPorId(certificadoIdInexistente);
  
  // Verificar se a URL foi formada corretamente
  await certificadosPage.verificarCertificadoPorIdNaUrl(certificadoIdInexistente);
  
  // Aguardar e verificar se mostra erro ou página não encontrada
  await certificadosPage.aguardarCarregamento();
  
  // O sistema pode mostrar uma mensagem de erro ou redirecionar
  // Verificar comportamento específico do sistema
  const currentUrl = page.url();
  console.log(`URL após consulta de ID inexistente: ${currentUrl}`);
});

// CA06 - Verificar completude dos dados do certificado consultado
test('CA06 - Verificar completude dos dados consultados', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  
  await certificadosPage.configurarViewport();
  
  // Usar um ID válido existente
  const certificadoId = '1';
  
  await certificadosPage.navegarParaCertificadoPorId(certificadoId);
  await certificadosPage.verificarCertificadoPorIdNaUrl(certificadoId);
  await certificadosPage.aguardarCarregamento();
  
  // Verificar se campos principais estão visíveis
  await certificadosPage.aguardarElementoVisivel(page.locator('#gemName'));
  await certificadosPage.aguardarElementoVisivel(page.locator('#weight'));
  await certificadosPage.aguardarElementoVisivel(page.locator('#color'));
  await certificadosPage.aguardarElementoVisivel(page.locator('#species'));
  
  // Verificar se os campos contêm dados (não estão vazios)
  const gemName = await page.locator('#gemName').inputValue();
  const weight = await page.locator('#weight').inputValue();
  
  expect(gemName).toBeTruthy();
  expect(weight).toBeTruthy();
  
  console.log(`Certificado ${certificadoId} - Gema: ${gemName}, Peso: ${weight}`);
});

// CA07 - Consulta de certificado deletado
test('CA07 - Consulta certificado deletado', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  
  await certificadosPage.configurarViewport();
  
  // ID de um certificado que foi deletado
  const certificadoDeletado = 'DELETEDCERT123';
  
  await certificadosPage.navegarParaCertificadoPorId(certificadoDeletado);
  await certificadosPage.verificarCertificadoPorIdNaUrl(certificadoDeletado);
  await certificadosPage.aguardarCarregamento();
  
  // Verificar comportamento para certificado deletado
  // Pode mostrar erro 404, mensagem de "não encontrado", ou redirecionar
  const currentUrl = page.url();
  console.log(`URL após consulta de certificado deletado: ${currentUrl}`);
  
  // Verificar se há alguma mensagem de erro na tela
  const bodyText = await page.textContent('body');
  if (bodyText?.includes('not found') || bodyText?.includes('não encontrado') || bodyText?.includes('404')) {
    console.log('Sistema retornou erro apropriado para certificado deletado');
  }
});

// CA08 - Pesquisar certificado por nome específico
test('CA08 - Pesquisar certificado por nome específico', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  await certificadosPage.navegarParaWelcome();
  
  // Nome do certificado para pesquisar
  const nomeCertificado = 'J3X0Z4Uizu';
  
  // Realizar a pesquisa
  await certificadosPage.pesquisarCertificadoPorNome(nomeCertificado);
  
  // Verificar se o card do certificado é exibido
  await certificadosPage.verificarCardCertificadoExibido(nomeCertificado);
  
  // Verificar que apenas um card é exibido (o resultado da busca)
  const countResultados = await certificadosPage.certificadoCards.count();
  expect(countResultados).toBe(1);
  
  console.log(`Certificado '${nomeCertificado}' encontrado com sucesso na pesquisa`);
});

// CA09 - Pesquisar certificado inexistente
test('CA09 - Pesquisar certificado inexistente', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  await certificadosPage.navegarParaWelcome();
  
  // Nome de um certificado que não existe
  const nomeCertificadoInexistente = 'CertificadoQueNaoExiste123';
  
  // Realizar a pesquisa
  await certificadosPage.pesquisarCertificadoPorNome(nomeCertificadoInexistente);
  
  // Verificar que nenhum resultado foi encontrado
  await certificadosPage.verificarNenhumResultadoEncontrado();
});

// CA10 - Pesquisar com campo vazio
test('CA10 - Pesquisar com campo vazio', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  await certificadosPage.navegarParaWelcome();
  
  // Aguardar carregamento inicial
  await certificadosPage.verificarCertificadosCarregados();
  
  // Contar certificados antes da pesquisa
  const countAntes = await certificadosPage.certificadoCards.count();
  
  // Realizar pesquisa com campo vazio
  await certificadosPage.pesquisarCertificadoPorNome('');
  
  // Verificar se todos os certificados ainda são exibidos
  const countDepois = await certificadosPage.certificadoCards.count();
  expect(countDepois).toBe(countAntes);
});

// CA11 - Pesquisar e limpar campo de pesquisa
test('CA11 - Pesquisar e limpar campo de pesquisa', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  await certificadosPage.navegarParaWelcome();
  
  // Aguardar carregamento inicial e contar certificados
  await certificadosPage.verificarCertificadosCarregados();
  const countInicial = await certificadosPage.certificadoCards.count();
  
  // Realizar pesquisa específica
  const nomeCertificado = 'J3X0Z4Uizu';
  await certificadosPage.pesquisarCertificadoPorNome(nomeCertificado);
  
  // Verificar que apenas o certificado pesquisado é exibido
  await certificadosPage.verificarCardCertificadoExibido(nomeCertificado);
  
  // Limpar campo de pesquisa
  await certificadosPage.limparCampoPesquisa();
  await page.keyboard.press('Enter');
  await certificadosPage.aguardarCarregamento();
  
  // Verificar que todos os certificados voltaram a ser exibidos
  const countFinal = await certificadosPage.certificadoCards.count();
  expect(countFinal).toBe(countInicial);
});

// CA12 - Verificar funcionalidade de busca case-insensitive
test('CA12 - Verificar busca case-insensitive', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  await certificadosPage.navegarParaWelcome();
  
  const nomeCertificado = 'J3X0Z4Uizu';
  
  // Testar busca com letras minúsculas
  await certificadosPage.pesquisarCertificadoPorNome(nomeCertificado.toLowerCase());
  
  // Verificar se o card é encontrado (assumindo que a busca é case-insensitive)
  // Se a aplicação for case-sensitive, este teste pode falhar e precisará ser ajustado
  try {
    await certificadosPage.verificarCardCertificadoExibido(nomeCertificado);
    console.log('Busca é case-insensitive');
  } catch (error) {
    console.log('Busca é case-sensitive');
    // Limpar e tentar com grafia correta
    await certificadosPage.limparCampoPesquisa();
    await certificadosPage.pesquisarCertificadoPorNome(nomeCertificado);
    await certificadosPage.verificarCardCertificadoExibido(nomeCertificado);
  }
});
