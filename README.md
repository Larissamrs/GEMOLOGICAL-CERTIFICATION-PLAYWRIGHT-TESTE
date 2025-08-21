# CertGema Automação

## Descrição
Este projeto utiliza a ferramenta Playwright para automatizar testes no site certGemas. O objetivo é garantir a qualidade e a funcionalidade do site através de testes automatizados.

## Estrutura do Projeto
- **/tests**: Contém os arquivos de teste.
- **/pages**: Contém os objetos de página que encapsulam a interação com as páginas do site.

## Pré-requisitos
- Node.js
- Playwright

## Instalação
1. Clone o repositório:
    ```sh
    git clone <URL_DO_REPOSITORIO>
    ```
2. Navegue até o diretório do projeto:
    ```sh
    cd Playwright-certGema
    ```
3. Instale as dependências:
    ```sh
    npm install
    ```

## Executando os Testes
Para executar os testes, utilize o comando:
```sh
npx playwright test
```

## Outras Formas de Executar os Testes
Para executar os testes em um navegador específico, utilize o comando:
```sh
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Executar Testes com Relatórios
Para gerar relatórios dos testes, utilize o comando:
```sh
npx playwright test --reporter=html
```
### Abrir Report Ortoni
Para abrir ortoni-report, utilize o comando:
```sh
npx ortoni-report show-report
```


