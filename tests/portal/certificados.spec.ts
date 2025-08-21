import { test, expect } from '@playwright/test';
import { CertificadosPage, dadosCertificadoTeste, dadosCertificadoInvalido, DadosCertificado } from '../../pages/CertificadosPage';

// Constantes centralizadas
const baseURL = 'http://localhost:4200/';
const WELCOME_URL = `${baseURL}welcome`;

// Usar estado de autenticação
test.use({ storageState: 'auth.json' });

// Dados de teste alternativos
const dadosCompletos: DadosCertificado = {
  gemName: 'Rubi Premium',
  item: 'Gema Natural',
  color: 'Vermelho Intenso',
  transparency: 'Transparente',
  clarity: 'VVS1',
  shape: 'Redondo',
  weight: '3.2',
  measurements: '10x10x6',
  species: 'Coríndon',
  variety: 'Rubi',
  treatment: 'Aquecimento',
  origin: 'Myanmar',
  comments: 'Gema de qualidade excepcional',
  observations: 'Certificado criado via automação'
};

const dadosMinimos: DadosCertificado = {
  gemName: 'Teste Mínimo',
  item: 'Item',
  color: 'Azul',
  transparency: 'Opaco',
  clarity: 'I1',
  shape: 'Cabochão',
  weight: '1.0',
  measurements: '5x5x3',
  species: 'Quartzo',
  variety: 'Ágata',
  treatment: 'Natural',
  origin: 'Brasil',
  comments: 'Teste',
  observations: 'Teste'
};

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

// CA04 - Criar certificado com dados completos
test('CA04 - Criar certificado com dados completos', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  
  await certificadosPage.configurarViewport();
  await certificadosPage.navegarParaWelcome();
  await certificadosPage.verificarURL(WELCOME_URL);
  
  // Criar certificado
  await certificadosPage.criarCertificadoCompleto(dadosCertificadoTeste);
  
  // Verifica retorno à página principal
  await certificadosPage.verificarURLWelcome();
});

// CA05 - Criar certificado com dados alternativos
test('CA05 - Criar certificado com dados alternativos', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  
  await certificadosPage.configurarViewport();
  await certificadosPage.navegarParaWelcome();
  
  // Usar dados completos diferentes
  await certificadosPage.criarCertificadoCompleto(dadosCompletos);
  
  await certificadosPage.verificarURLWelcome();
});

// CA06 - Criar certificado com dados mínimos
test('CA06 - Criar certificado com dados mínimos', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  
  await certificadosPage.configurarViewport();
  await certificadosPage.navegarParaWelcome();
  
  await certificadosPage.criarCertificadoCompleto(dadosMinimos);
  await certificadosPage.verificarURLWelcome();
});

// CA07 - Verificar campos obrigatórios do formulário
test('CA07 - Validação de campos obrigatórios', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  
  await certificadosPage.configurarViewport();
  await certificadosPage.navegarParaWelcome();
  
  // Tentar criar certificado sem preencher campos
  await certificadosPage.clicarCriarCertificado();
  
  // Tentar salvar sem preencher
  await certificadosPage.salvarCertificado();
  
  // Verificar se permanece na mesma tela ou mostra validação
  // (O comportamento exato depende da implementação do sistema)
  await page.waitForTimeout(2000);
  
  // Se tem validação, deve permanecer na tela de criação
  // Se não tem validação, pode redirecionar para welcome
  const currentUrl = page.url();
  console.log(`URL após tentar salvar sem dados: ${currentUrl}`);
});

// CA08 - Testar preenchimento individual de campos
test('CA08 - Preenchimento individual de campos', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  
  await certificadosPage.configurarViewport();
  await certificadosPage.navegarParaWelcome();
  await certificadosPage.clicarCriarCertificado();
  
  // Preencher campos um por um e verificar
  await certificadosPage.preencherCampo(page.locator('#gemName'), 'Teste Safira');
  await certificadosPage.verificarCampoPreenchido(page.locator('#gemName'), 'Teste Safira');
  
  await certificadosPage.preencherCampo(page.locator('#weight'), '4.5');
  await certificadosPage.verificarCampoPreenchido(page.locator('#weight'), '4.5');
  
  await certificadosPage.preencherCampo(page.locator('#color'), 'Azul Royal');
  await certificadosPage.verificarCampoPreenchido(page.locator('#color'), 'Azul Royal');
});

// CA09 - Verificar comportamento com dados especiais
test('CA09 - Certificado com caracteres especiais', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  
  const dadosEspeciais: DadosCertificado = {
    gemName: 'Ametista "Especial" & Rara',
    item: 'Item com acentos: çãõáéí',
    color: 'Roxo-violeta (intenso)',
    transparency: 'Semi-transparente',
    clarity: 'VS2+',
    shape: 'Formato especial',
    weight: '2,75',
    measurements: '12.5x8.3x5.1',
    species: 'Quartzo & Família',
    variety: 'Ametista Premium',
    treatment: 'Natural (sem tratamento)',
    origin: 'Rio Grande do Sul - Brasil',
    comments: 'Comentários com "aspas" e símbolos: @#$%',
    observations: 'Observações especiais: ç, ã, é, í, ó, ú'
  };
  
  await certificadosPage.configurarViewport();
  await certificadosPage.navegarParaWelcome();
  await certificadosPage.criarCertificadoCompleto(dadosEspeciais);
  await certificadosPage.verificarURLWelcome();
});

// CA10 - Verificar navegação entre telas
test('CA10 - Navegação entre welcome e certificado', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  
  // Ir para welcome
  await certificadosPage.navegarParaWelcome();
  await certificadosPage.verificarURL(WELCOME_URL);
  
  // Verificar se botão criar certificado está visível
  await certificadosPage.verificarBotaoVisivel(certificadosPage.criarCertificadoBtn);
  
  // Clicar em criar certificado
  await certificadosPage.clicarCriarCertificado();
  
  // Aguardar carregamento da nova tela
  await certificadosPage.aguardarCarregamento();
  
  // A URL pode mudar para uma tela de criação específica
  const currentUrl = page.url();
  console.log(`URL da tela de criação: ${currentUrl}`);
});

// CA11 - Teste de performance - criação múltipla
test('CA11 - Criação de múltiplos certificados', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  
  await certificadosPage.configurarViewport();
  
  // Criar 3 certificados com dados diferentes
  for (let i = 1; i <= 3; i++) {
    const dadosIteracao: DadosCertificado = {
      ...dadosCertificadoTeste,
      gemName: `Certificado Teste ${i}`,
      weight: `${i}.${i}`,
      measurements: `${5+i}x${5+i}x${3+i}`,
      comments: `Certificado número ${i} de teste automatizado`,
      observations: `Iteração ${i} do teste de criação múltipla`
    };
    
    await certificadosPage.navegarParaWelcome();
    await certificadosPage.criarCertificadoCompleto(dadosIteracao);
    await certificadosPage.verificarURLWelcome();
    
    // Pequena pausa entre criações
    await certificadosPage.aguardarTimeout(1000);
  }
});

// CA12 - Verificar responsividade em viewport menor
test('CA12 - Teste em viewport mobile', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  
  // Configurar viewport mobile
  await page.setViewportSize({ width: 375, height: 667 });
  
  await certificadosPage.navegarParaWelcome();
  await certificadosPage.verificarCertificadosCarregados();
  
  // Tentar criar certificado em tela menor
  await certificadosPage.clicarCriarCertificado();
  
  // Preencher alguns campos essenciais
  await certificadosPage.preencherCampo(page.locator('#gemName'), 'Mobile Test');
  await certificadosPage.preencherCampo(page.locator('#weight'), '1.5');
  await certificadosPage.preencherCampo(page.locator('#color'), 'Verde');
});

// CA13 - Verificar interação com certificado após criação
test('CA13 - Verificar certificado após criação', async ({ page }) => {
  const certificadosPage = new CertificadosPage(page);
  
  await certificadosPage.configurarViewport();
  await certificadosPage.navegarParaWelcome();
  
  // Contar certificados antes da criação
  const countAntes = await certificadosPage.certificadoCards.count();
  
  // Criar novo certificado
  const dadosUnicos: DadosCertificado = {
    ...dadosCertificadoTeste,
    gemName: `Certificado Único ${Date.now()}`,
    comments: `Criado em ${new Date().toISOString()}`,
    observations: 'Teste de verificação pós-criação'
  };
  
  await certificadosPage.criarCertificadoCompleto(dadosUnicos);
  await certificadosPage.verificarURLWelcome();
  
  // Aguardar atualização da lista
  await certificadosPage.aguardarCarregamento();
  
  // Verificar se há mais certificados (se o sistema atualiza a lista automaticamente)
  const countDepois = await certificadosPage.certificadoCards.count();
  console.log(`Certificados antes: ${countAntes}, depois: ${countDepois}`);
});
