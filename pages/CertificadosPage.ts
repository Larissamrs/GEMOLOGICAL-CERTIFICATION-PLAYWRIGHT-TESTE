import { Page, Locator, expect } from '@playwright/test';

export class CertificadosPage {
  private readonly page: Page;
  
  // Locators principais
  private readonly criarCertificadoButton: Locator;
  private readonly certificadoCard: Locator;
  private readonly salvarCertificadoButton: Locator;
  
  // Campos do formulário de certificado
  private readonly gemNameInput: Locator;
  private readonly itemInput: Locator;
  private readonly colorInput: Locator;
  private readonly transparencyInput: Locator;
  private readonly clarityInput: Locator;
  private readonly shapeInput: Locator;
  private readonly weightInput: Locator;
  private readonly measurementsInput: Locator;
  private readonly speciesInput: Locator;
  private readonly varietyInput: Locator;
  private readonly treatmentInput: Locator;
  private readonly originInput: Locator;
  private readonly commentsInput: Locator;
  private readonly observationsInput: Locator;

  // URLs
  private readonly BASE_URL = 'http://localhost:4200/';
  private readonly WELCOME_URL = 'http://localhost:4200/welcome';
  private readonly CERTIFICATE_URL_PATTERN = /\/certificate(\?.*)?$/;

  constructor(page: Page) {
    this.page = page;
    
    // Botões principais
    this.criarCertificadoButton = page.getByText('Criar Certificado');
    this.certificadoCard = page.locator('div.gemologo-card');
    this.salvarCertificadoButton = page.getByText('Salvar Certificado');
    
    // Campos do formulário
    this.gemNameInput = page.locator('#gemName');
    this.itemInput = page.locator('#item');
    this.colorInput = page.locator('#color');
    this.transparencyInput = page.locator('#transparency');
    this.clarityInput = page.locator('#clarity');
    this.shapeInput = page.locator('#shape');
    this.weightInput = page.locator('#weight');
    this.measurementsInput = page.locator('#measurements');
    this.speciesInput = page.locator('#species');
    this.varietyInput = page.locator('#variety');
    this.treatmentInput = page.locator('#treatment');
    this.originInput = page.locator('#origin');
    this.commentsInput = page.locator('#comments');
    this.observationsInput = page.locator('#observations');
  }

  // Navegação
  async navegarParaWelcome(): Promise<void> {
    await this.page.goto(this.WELCOME_URL);
  }

  async configurarViewport(): Promise<void> {
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  // Ações principais
  async clicarCriarCertificado(): Promise<void> {
    await this.aguardarElementoVisivel(this.criarCertificadoButton);
    await this.criarCertificadoButton.click();
  }

  async clicarPrimeiroCertificado(): Promise<void> {
    const primeiroCertificado = this.certificadoCard.first();
    await this.aguardarElementoVisivel(primeiroCertificado);
    await primeiroCertificado.click();
  }

  async preencherCampo(locator: Locator, valor: string): Promise<void> {
    await this.aguardarElementoVisivel(locator);
    await locator.click();
    await locator.fill(valor);
    await expect(locator).toHaveValue(valor);
  }

  async salvarCertificado(): Promise<void> {
    await this.aguardarElementoVisivel(this.salvarCertificadoButton);
    await this.salvarCertificadoButton.click();
  }

  // Preenchimento completo do formulário
  async preencherFormularioCertificado(dadosCertificado: DadosCertificado): Promise<void> {
    await this.preencherCampo(this.gemNameInput, dadosCertificado.gemName);
    await this.preencherCampo(this.itemInput, dadosCertificado.item);
    await this.preencherCampo(this.colorInput, dadosCertificado.color);
    await this.preencherCampo(this.transparencyInput, dadosCertificado.transparency);
    await this.preencherCampo(this.clarityInput, dadosCertificado.clarity);
    await this.preencherCampo(this.shapeInput, dadosCertificado.shape);
    await this.preencherCampo(this.weightInput, dadosCertificado.weight);
    await this.preencherCampo(this.measurementsInput, dadosCertificado.measurements);
    await this.preencherCampo(this.speciesInput, dadosCertificado.species);
    await this.preencherCampo(this.varietyInput, dadosCertificado.variety);
    await this.preencherCampo(this.treatmentInput, dadosCertificado.treatment);
    await this.preencherCampo(this.originInput, dadosCertificado.origin);
    await this.preencherCampo(this.commentsInput, dadosCertificado.comments);
    await this.preencherCampo(this.observationsInput, dadosCertificado.observations);
  }

  async criarCertificadoCompleto(dadosCertificado: DadosCertificado): Promise<void> {
    await this.clicarCriarCertificado();
    await this.preencherFormularioCertificado(dadosCertificado);
    await this.salvarCertificado();
  }

  // Verificações
  async verificarCertificadosCarregados(): Promise<void> {
    const primeiroCertificado = this.certificadoCard.first();
    await expect(primeiroCertificado).toBeVisible();
  }

  async verificarQuantidadeCertificados(quantidade: number): Promise<void> {
    await expect(this.certificadoCard).toHaveCount(quantidade);
  }

  async verificarCertificadoVisivel(index: number = 0): Promise<void> {
    await expect(this.certificadoCard.nth(index)).toBeVisible();
  }

  async verificarURL(url: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(url);
  }

  async verificarURLCertificate(): Promise<void> {
    await expect(this.page).toHaveURL(this.CERTIFICATE_URL_PATTERN);
  }

  async verificarURLWelcome(): Promise<void> {
    await expect(this.page).toHaveURL(/\/welcome(\?.*)?$/);
  }

  async verificarBotaoVisivel(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  async verificarCampoPreenchido(locator: Locator, valorEsperado: string): Promise<void> {
    await expect(locator).toHaveValue(valorEsperado);
  }

  async verificarTextoElemento(locator: Locator, textoEsperado: string): Promise<void> {
    await expect(locator).toHaveText(textoEsperado);
  }

  // Métodos utilitários
  async aguardarElementoVisivel(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
  }

  async aguardarCarregamento(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
  }

  async aguardarTimeout(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  // Getters
  get welcomeUrl(): string {
    return this.WELCOME_URL;
  }

  get baseUrl(): string {
    return this.BASE_URL;
  }

  get certificateUrlPattern(): RegExp {
    return this.CERTIFICATE_URL_PATTERN;
  }

  // Locators públicos para testes específicos
  get criarCertificadoBtn(): Locator {
    return this.criarCertificadoButton;
  }

  get certificadoCards(): Locator {
    return this.certificadoCard;
  }

  get salvarCertificadoBtn(): Locator {
    return this.salvarCertificadoButton;
  }
}

// Interface para dados do certificado
export interface DadosCertificado {
  gemName: string;
  item: string;
  color: string;
  transparency: string;
  clarity: string;
  shape: string;
  weight: string;
  measurements: string;
  species: string;
  variety: string;
  treatment: string;
  origin: string;
  comments: string;
  observations: string;
}

// Dados de teste padrão
export const dadosCertificadoTeste: DadosCertificado = {
  gemName: 'Esmeralda Teste',
  item: 'Pedra Preciosa',
  color: 'Verde',
  transparency: 'Transparente',
  clarity: 'VS1',
  shape: 'Oval',
  weight: '2.5',
  measurements: '8x6x4',
  species: 'Berilo',
  variety: 'Esmeralda',
  treatment: 'Natural',
  origin: 'Brasil',
  comments: 'Certificado de teste automatizado',
  observations: 'Teste realizado pelo Playwright'
};

export const dadosCertificadoInvalido: DadosCertificado = {
  gemName: '',
  item: '',
  color: '',
  transparency: '',
  clarity: '',
  shape: '',
  weight: '',
  measurements: '',
  species: '',
  variety: '',
  treatment: '',
  origin: '',
  comments: '',
  observations: ''
};
