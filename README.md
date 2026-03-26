# 🍵🍓 matcha strawberry — agenda

Agenda pessoal estética com cores customizáveis, visualização por dia/semana/mês, drag & drop e repetição de tarefas.

## Stack

- **Next.js 14** (App Router)
- **PostgreSQL** + **Prisma ORM**
- **@dnd-kit** — drag & drop
- **date-fns** — manipulação de datas
- **Tailwind CSS** + fonte Lora (Google Fonts)

---

## 🚀 Como rodar

### 1. Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente ou na nuvem (Railway, Neon, Supabase, etc.)

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar banco de dados

Crie o arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/agenda_db?schema=public"
```

> Troque `SEU_USUARIO`, `SUA_SENHA` e `agenda_db` pelos seus dados.

### 4. Criar as tabelas no banco

```bash
npm run db:push
```

Ou com migrations (recomendado para produção):

```bash
npm run db:migrate
```

### 5. Gerar o Prisma Client

```bash
npm run db:generate
```

### 6. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) 🎉

---

## 📱 Instalar como app (PWA)

No celular, abra o site no navegador e toque em **"Adicionar à tela inicial"**.  
No computador, clique no ícone de instalar na barra de endereços do Chrome.

---

## 🗄️ Gerenciar banco de dados

```bash
npm run db:studio
```

Abre o Prisma Studio — interface visual para ver e editar os dados.

---

## 🌐 Deploy (Vercel + Neon)

1. Crie um banco gratuito em [neon.tech](https://neon.tech)
2. Copie a `DATABASE_URL` do Neon
3. Faça deploy na Vercel:
   ```bash
   npx vercel
   ```
4. Adicione a variável `DATABASE_URL` nas configurações da Vercel

---

## 📁 Estrutura do projeto

```
src/
├── app/
│   ├── api/
│   │   ├── tasks/
│   │   │   ├── route.ts          # GET (listar) + POST (criar)
│   │   │   ├── [id]/route.ts     # PATCH (editar) + DELETE
│   │   │   └── reorder/route.ts  # PATCH (reordenar drag & drop)
│   │   └── categories/
│   │       └── route.ts          # GET + POST categorias
│   ├── page.tsx                  # Página principal
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── TaskModal.tsx             # Modal criar/editar tarefa
│   ├── TaskCard.tsx              # Card draggável
│   ├── WeekView.tsx              # Visualização semanal
│   ├── MonthView.tsx             # Visualização mensal
│   └── DayView.tsx               # Visualização diária
├── hooks/
│   └── useTasks.ts               # Hook de dados (fetch + mutations)
├── lib/
│   ├── prisma.ts                 # Singleton do Prisma
│   └── utils.ts                  # Utilitários + paleta de cores
└── types/
    └── index.ts                  # Tipos TypeScript

prisma/
└── schema.prisma                 # Schema do banco de dados
```

---

## 🎨 Paleta de cores

| Cor | Hex |
|-----|-----|
| Rosa escuro | `#C66F80` |
| Rosa claro | `#F4C7D0` |
| Rosa pastel | `#FCE8EE` |
| Verde escuro | `#4A6644` |
| Verde médio | `#9FAA74` |
| Verde claro | `#D7DAB3` |
| Bege | `#ECE3D2` |

---

## ✨ Funcionalidades

- ✅ Criar, editar e excluir tarefas
- ✅ Escolher cor customizada por tarefa
- ✅ Definir horário de início e fim
- ✅ Dia inteiro (all day)
- ✅ Repetição: diária, semanal, mensal
- ✅ Repetição semanal por dias específicos
- ✅ Data limite de repetição
- ✅ Categorias com cor
- ✅ Arrastar e reordenar (drag & drop)
- ✅ Visualização: Dia / Semana / Mês
- ✅ Instalável como PWA (app no celular)
- ✅ Responsivo para mobile
