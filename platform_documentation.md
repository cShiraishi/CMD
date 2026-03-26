# Documentação da Plataforma: Chelidonium majus L. Database

## 1. Visão Geral
Esta plataforma foi desenvolvida como uma base de dados interativa e visual para explorar compostos bioativos da planta *Chelidonium majus* L. O objetivo principal é fornecer aos pesquisadores uma ferramenta rápida, acessível e esteticamente agradável para buscar, filtrar e analisar propriedades físico-químicas de moléculas específicas.

## 2. Arquitetura e Tecnologias

A aplicação foi construída utilizando uma arquitetura **Serverless Static Site** (Site Estático), o que garante alta performance, segurança e facilidade de hospedagem (via GitHub Pages). Não há banco de dados tradicional (SQL); os dados são pré-processados e embutidos na aplicação.

### Stack Tecnológico:

#### Backend de Dados (Processamento):
*   **Python 3.x**: Linguagem principal para manipulação de dados.
*   **RDKit**: Biblioteca de quimioinformática utilizada para:
    *   Ler strings SMILES.
    *   Calcular propriedades moleculares (Peso Molecular, LogP, TPSA).
    *   Gerar imagens 2D (SVG) das estruturas químicas.
    *   Gerar arquivos de estrutura 3D/2D (SDF) para download.
*   **Pandas**: Utilizado para leitura e estruturação dos dados brutos (Excel).

#### Frontend (Interface do Usuário):
*   **HTML5**: Estrutura semântica da página.
*   **CSS3 (Vanilla)**: Estilização customizada, sem uso de frameworks pesados (como Bootstrap), garantindo leveza.
    *   *Design System*: Utiliza variáveis CSS para temas (Claro/Escuro), responsividade via Grid/Flexbox e estética moderna ("Glassmorphism").
*   **JavaScript (ES6+)**: Lógica interativa do lado do cliente.
    *   Filtragem em tempo real.
    *   Gerenciamento de eventos (cliques, modais).
    *   Manipulação do DOM.
*   **Chart.js**: Biblioteca leve para geração dos gráficos estatísticos no dashboard de análise.

## 3. Pipeline de Dados (Como funciona nos bastidores)

O "coração" da plataforma é um script de automação (`process_data.py`) que transforma os dados brutos em uma aplicação web funcional. O fluxo é o seguinte:

1.  **Entrada**: Um arquivo Excel (`compounds_AnaB.xlsx`) contendo nomes e códigos SMILES dos compostos.
2.  **Processamento**:
    *   O script itera sobre cada composto.
    *   O RDKit valida o SMILES e calcula as propriedades (MW, LogP, TPSA).
    *   Uma imagem vetorial (.svg) é gerada e salva na pasta `assets/images`.
    *   Um arquivo estrutural (.sdf) é gerado na pasta `assets/sdf` para download.
3.  **Saída**: Todos os dados processados são compilados em um único arquivo JavaScript (`data.js`) na forma de um objeto JSON global. Isso permite que o site carregue instantaneamente sem fazer requisições lentas a um servidor.

## 4. Funcionalidades Principais

*   **Busca Inteligente**: Permite pesquisar por nome, classe química ou fórmula molecular.
*   **Filtros Avançados**:
    *   Filtros deslizantes e numéricos para Peso Molecular (MW), Lipofilicidade (LogP) e Área de Superfície Polar (TPSA).
    *   Filtro por categorias (Classes Químicas).
*   **Dashboard Analítico**: Uma visão macro da base de dados com gráficos interativos mostrando a distribuição das propriedades químicas e contagem de classes.
*   **Visualização Química**:
    *   Renderização 2D de alta qualidade das moléculas.
    *   Exibição de SMILES (com opção de copiar/visualizar).
    *   Download direto de arquivos SDF para uso em softwares de acoplamento molecular (docking).

## 5. Design e Experiência do Usuário (UX)

O design foi focado na **clareza e usabilidade**:
*   **Tema Claro/Clean**: Fundo branco com acentos em azul científico, transmitindo limpeza e profissionalismo.
*   **Cards Interativos**: Cada molécula é apresentada como um "cartão" contendo informações essenciais e imagem.
*   **Feedback Visual**: Animações suaves (hover effects) e tooltips para informações detalhadas.
*   **Responsividade**: O layout se adapta automaticamente a telas de desktops, tablets e smartphones.

---
*Documento gerado automaticamente pela equipe de desenvolvimento.*
