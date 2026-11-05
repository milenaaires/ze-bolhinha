# Zé Bolhinha

Repositório do projeto final do Grupo 1. Este espaço guarda a documentação versionada e publica os arquivos Markdown de `docs/` no GitHub Pages.

**Visibilidade:** ao tornar este repositório público, todos os arquivos e o histórico de commits ficam acessíveis na internet. O Pages publica apenas `docs/`; isso não torna `interno/` privado.

## Adicionar ou atualizar documentos

- Coloque documentos que podem aparecer no site em `docs/` (organize em subpastas quando necessário).
- Coloque em `interno/` apenas notas internas sem dados pessoais. Essa pasta não entra no site, mas é pública no GitHub. Registros de entrevistas, contatos e feedbacks individuais vão para a pasta RESTRITO do Drive do grupo.
- Cada envio para `main` que alterar `docs/`, `mkdocs.yml`, `requirements.txt` ou o fluxo de publicação aciona o GitHub Actions para atualizar o site.

Antes de mover conteúdo de `interno/` para `docs/`, confirme que ele pode ser compartilhado com o público do site.

## Prévia local

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
mkdocs serve
```

Desde 05/11/2026 o grupo não usa mais o Notion. As tarefas ficam no GitHub Projects do repositório, e os documentos de trabalho, que podem conter dados pessoais da pesquisa, ficam na pasta privada do grupo no Google Drive. Este repositório guarda só o que já foi consolidado e pode ser público. O GitHub Pages é público, mesmo com este repositório privado: revise os arquivos em `docs/` antes de cada publicação.

## Histórico de versões

| Versão | Data | Alteração | Responsável pela edição |
|---|---|---|---|
| 1.2 | 05/11/2026 | Registro da saída do Notion: tarefas no GitHub Projects e documentos no Google Drive. | Ryan Nascimento |
| 1.1 | 13/10/2026 | Registro do fluxo de organização dos conteúdos do Notion e publicação no Pages. | Milena Aires |

