import { type Page, type Locator, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4200';

export class GemologosPage {
  readonly page: Page;
  readonly url: string = `${BASE_URL}/buscar-gemologos`;

  readonly listaGemologos: Locator;
  readonly cardGemologo: Locator;
  readonly indicadorCarregamento: Locator;
  readonly mensagemSucesso: Locator;
  readonly mensagemErro: Locator;
  readonly tituloPagina: Locator;

  constructor(page: Page) {
    this.page = page;

    this.tituloPagina = page.locator('h1.title', { hasText: 'Gemólogos Cadastrados' });
    this.listaGemologos = page.locator('.gemologos-grid');
    this.cardGemologo = page.locator('.gemologo-card');
    this.indicadorCarregamento = page.locator('.loading');
    this.mensagemSucesso = page.locator('div.p-toast-message-success');
    this.mensagemErro = page.locator('div.p-toast-message-error');
  }

  async navegarPara() {
    await this.page.goto(this.url);
  }

  async aguardarCarregamento() {

    await this.indicadorCarregamento.waitFor({ state: 'hidden', timeout: 10000 });

    await this.page.waitForSelector('.gemologos-grid', { state: 'attached', timeout: 10000 });
  }

  async verificarGemologosCarregados() {
    await expect(this.listaGemologos).toBeVisible();
    const count = await this.cardGemologo.count();
    expect(count).toBeGreaterThan(0);
  }

  async verificarVisibilidadeIndicadorCarregamento(visivel: boolean) {
    if (visivel) {
      await expect(this.indicadorCarregamento).toBeVisible();
    } else {
      await expect(this.indicadorCarregamento).not.toBeVisible();
    }
  }

  async verificarMensagemDeSucessoVisivel() {
    await expect(this.mensagemSucesso).toBeVisible();
    await expect(this.mensagemSucesso.locator('.p-toast-summary')).toHaveText('Sucesso');
    await expect(this.mensagemSucesso.locator('.p-toast-detail')).toHaveText(
      'Gemólogos carregados com sucesso!'
    );
  }

  async verificarMensagemDeErroVisivel() {
    await expect(this.mensagemErro).toBeVisible();
    await expect(this.mensagemErro.locator('.p-toast-summary')).toHaveText('Erro');
    await expect(this.mensagemErro.locator('.p-toast-detail')).toHaveText(
      'Erro ao carregar a lista de gemólogos.'
    );
  }
}
