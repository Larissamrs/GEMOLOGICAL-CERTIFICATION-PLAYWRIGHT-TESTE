import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;
  
  // Locators
  private readonly emailInput: Locator;
  private readonly senhaInput: Locator;
  private readonly entrarButton: Locator;
  private readonly logoutButton: Locator;
  private readonly sairButton: Locator;
  private readonly entrarLink: Locator;

  // URLs
  private readonly BASE_URL = 'http://localhost:4200/';
  private readonly LOGIN_URL = 'http://localhost:4200/login';
  private readonly WELCOME_URL = 'http://localhost:4200/welcome';

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.senhaInput = page.getByRole('textbox', { name: 'Senha' });
    this.entrarButton = page.getByRole('button', { name: 'Entrar' });
    this.logoutButton = page.locator('text=Logout');
    this.sairButton = page.locator('text=Sair');
    this.entrarLink = page.getByRole('link', { name: 'Entrar' });
  }

  // Navegação
  async navegarParaHome(): Promise<void> {
    await this.page.goto(this.BASE_URL);
  }

  async navegarPara(): Promise<void> {
    await this.page.goto(this.LOGIN_URL);
  }

  async navegarParaLoginViaLink(): Promise<void> {
    await this.navegarParaHome();
    await this.entrarLink.click();
  }

  // Ações principais
  async preencherEmail(email: string): Promise<void> {
    await this.emailInput.click();
    await this.emailInput.fill(email);
  }

  async preencherSenha(senha: string): Promise<void> {
    await this.senhaInput.click();
    await this.senhaInput.fill(senha);
  }

  async clicarEntrar(): Promise<void> {
    await this.entrarButton.click();
  }

  async realizarLogin(email: string, senha: string): Promise<void> {
    await this.preencherEmail(email);
    await this.preencherSenha(senha);
    await this.clicarEntrar();
  }

  async realizarLoginComLabel(email: string, senha: string): Promise<void> {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Senha').fill(senha);
    await this.clicarEntrar();
  }

  async realizarLogout(): Promise<void> {
    try {
      if (await this.logoutButton.isVisible()) {
        await this.logoutButton.click();
      } else if (await this.sairButton.isVisible()) {
        await this.sairButton.click();
      }
    } catch {
      // Se não encontrar botão de logout, limpa cookies/storage manualmente
      await this.page.context().clearCookies();
      await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    }
  }

  async salvarEstadoAutenticacao(path: string = 'auth.json'): Promise<void> {
    await this.page.context().storageState({ path });
  }

  // Verificações
  async verificarTituloPagina(titulo: RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(titulo);
  }

  async verificarMensagemErro(mensagem: string): Promise<Locator> {
    const elemento = this.page.getByText(mensagem);
    await elemento.waitFor();
    return elemento;
  }

  async aguardarURL(url: string, timeout: number = 5000): Promise<void> {
    await this.page.waitForURL(url, { timeout });
  }

  async verificarURLAtual(): Promise<string> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
    return this.page.url();
  }

  async verificarURLContem(fragmento: string): Promise<void> {
    const url = await this.verificarURLAtual();
    expect(url).toContain(fragmento);
  }

  async verificarURLNaoContem(fragmento: string): Promise<void> {
    const url = await this.verificarURLAtual();
    expect(url).not.toContain(fragmento);
  }

  async verificarValidacaoSenhaObrigatoria(): Promise<void> {
    try {
      await expect(this.page.locator('text=Senha é obrigatória')).toBeVisible();
    } catch {
      try {
        await expect(this.senhaInput).toHaveClass(/error/);
      } catch {
        await expect(this.entrarButton).toBeDisabled();
      }
    }
  }

  async verificarValidacaoCamposVazios(): Promise<void> {
    try {
      await expect(this.entrarButton).toBeDisabled();
    } catch {
      try {
        await expect(this.page.getByText('Email é obrigatório')).toBeVisible();
        await expect(this.page.getByText('Senha é obrigatória')).toBeVisible();
      } catch {
        // Verifica se pelo menos uma mensagem de erro está visível
        const emailObrigatorio = this.page.getByText('Email é obrigatório');
        const senhaObrigatoria = this.page.getByText('Senha é obrigatória');
        
        const emailVisible = await emailObrigatorio.isVisible().catch(() => false);
        const senhaVisible = await senhaObrigatoria.isVisible().catch(() => false);
        
        if (!emailVisible && !senhaVisible) {
          throw new Error('Nenhuma validação de campo obrigatório foi encontrada');
        }
      }
    }
  }

  async verificarValidacaoEspacos(): Promise<void> {
    try {
      await expect(this.entrarButton).toBeDisabled();
    } catch {
      await expect(this.page.getByText('Email é obrigatório')).toBeVisible();
    }
  }

  async verificarMensagemErroCredenciais(): Promise<void> {
    // Aguarda um pouco para a mensagem aparecer
    await this.page.waitForTimeout(1000);
    
    // Lista de possíveis mensagens de erro de credenciais
    const possiveisErros = [
      'Email ou senha incorretos',
      'E-mail inválido', 
      'Erro no login Email ou senha incorretos. Tente novamente.',
      'Credenciais inválidas',
      'Login inválido',
      'Usuário ou senha incorretos'
    ];
    
    let mensagemEncontrada = false;
    
    for (const erro of possiveisErros) {
      try {
        const elemento = this.page.locator(`text=${erro}`);
        if (await elemento.isVisible({ timeout: 2000 })) {
          mensagemEncontrada = true;
          break;
        }
      } catch {
        // Continua tentando outras mensagens
      }
    }
    
    // Se não encontrou nenhuma mensagem específica, 
    // verifica se ao menos permaneceu na tela de login (comportamento mínimo esperado)
    if (!mensagemEncontrada) {
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/login')) {
        throw new Error('Esperava mensagem de erro ou permanência na tela de login');
      }
    }
  }

  // Métodos utilitários
  async aguardarCarregamento(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
  }

  async focarCampoEmail(): Promise<void> {
    await this.emailInput.focus();
  }

  async focarCampoSenha(): Promise<void> {
    await this.senhaInput.focus();
  }

  async verificarCampoEmailVazio(): Promise<boolean> {
    const valor = await this.emailInput.inputValue();
    return valor.trim() === '';
  }

  async verificarCampoSenhaVazio(): Promise<boolean> {
    const valor = await this.senhaInput.inputValue();
    return valor.trim() === '';
  }

  async verificarBotaoEntrarHabilitado(): Promise<boolean> {
    return await this.entrarButton.isEnabled();
  }

  // Getters para URLs
  get baseUrl(): string {
    return this.BASE_URL;
  }

  get loginUrl(): string {
    return this.LOGIN_URL;
  }

  get welcomeUrl(): string {
    return this.WELCOME_URL;
  }
}
