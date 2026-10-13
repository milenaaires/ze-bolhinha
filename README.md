# Zé Bolhinha

Repositório do projeto final do Grupo 1. Este espaço guarda a documentação versionada e publica os arquivos Markdown de `docs/` no GitHub Pages.

**Visibilidade:** ao tornar este repositório público, todos os arquivos e o histórico de commits ficam acessíveis na internet. O Pages publica apenas `docs/`; isso não torna `interno/` privado.

## Adicionar ou atualizar documentos

- Coloque documentos que podem aparecer no site em `docs/` (organize em subpastas quando necessário).
- Coloque materiais de uso interno em `interno/`. Essa pasta não entra no site.
- Cada envio para `main` que alterar `docs/`, `mkdocs.yml`, `requirements.txt` ou o fluxo de publicação aciona o GitHub Actions para atualizar o site.

Antes de mover conteúdo de `interno/` para `docs/`, confirme que ele pode ser compartilhado com o público do site.

## Prévia local

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
mkdocs serve
```

O conteúdo estruturado a partir do Notion é um retrato do estado encontrado em 13/10/2026. O Notion continua sendo a fonte original; mudanças feitas lá não são sincronizadas automaticamente com este repositório. O GitHub Pages é público, mesmo com este repositório privado: revise os arquivos em `docs/` antes de cada publicação.

