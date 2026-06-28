# DNA Facilities — Sistema de Automação Industrial Web

![DNA Facilities](https://img.shields.io/badge/DNA-Facilities-054664?style=for-the-badge)
![AWS](https://img.shields.io/badge/AWS-Cloud-FF9900?style=for-the-badge&logo=amazon-aws)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC?style=for-the-badge&logo=terraform)

Sistema completo de monitoramento e automação de infraestrutura predial com coleta de dados em tempo real, dashboards interativos e relatórios automatizados. Desenvolvido para a **DNA Facilities** no contexto do **SESC Sede**.

---

## Visão Geral

O sistema monitora em tempo real os principais ativos de infraestrutura predial:

- ⚡ **Energia** — consumo elétrico, correntes, tensões, fator de potência
- 💧 **Água** — consumo em m³, picos, médias por período
- 🛢️ **Nível** — reservatórios de combustível e água potável
- 📊 **Status** — 38 medidores IoT com monitoramento de conectividade

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        DNA Facilities                           │
│                   Sistema de Automação Web                      │
└──────────────────────────────┬──────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   ┌────▼────┐           ┌─────▼────┐          ┌─────▼────┐
   │Módulo 1 │           │Módulo 2  │          │Módulo 3  │
   │Extração │           │Segurança │          │Dados AWS │
   │de Dados │           │e Acesso  │          │          │
   └────┬────┘           └─────┬────┘          └─────┬────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                        ┌──────▼──────┐
                        │  Módulo 4   │
                        │ Interface   │
                        │    Web      │
                        └─────────────┘
```

---

## Módulos

### Módulo 1 — Extração e Exportação de Dados

Responsável pela coleta, processamento e disponibilização dos dados dos medidores IoT.

**Tecnologias:** AWS Lambda (Python) · SQS · S3 · API Gateway

**Lambdas:**
- `request_report` — Recebe solicitações de relatórios via API
- `process_report` — Processa e gera os relatórios (XLSX, PDF, CSV)
- `notify_user` — Envia e-mail com link de download via SES

**Infraestrutura (Terraform):**
```
infra/terraform/
├── main.tf          # Provider AWS e configurações globais
├── api_gateway.tf   # Endpoints REST
├── lambdas.tf       # Funções Lambda
├── s3.tf            # Bucket de relatórios
├── sqs.tf           # Fila de processamento assíncrono
├── iam.tf           # Policies e roles
└── variables.tf     # Variáveis configuráveis
```

---

### Módulo 2 — Governança, Segurança e Controle de Acesso

Autenticação, autorização e auditoria com controle baseado em atributos (ABAC).

**Tecnologias:** AWS Cognito · IAM · CloudWatch · S3 Object Lock · WAF

**Lambdas:**
- `token_authorizer` — Valida JWT do Cognito em cada requisição
- `audit_logger` — Registra todos os acessos e operações para auditoria

**Claims JWT (ABAC):**
```json
{
  "custom:role":       "Administrador | Analista | Operador",
  "custom:department": "Administrativo | Manutenção | Operações",
  "custom:plant":      "SP-01 | SP-02 | ...",
  "cognito:groups":    ["Administrador"]
}
```

---

### Módulo 3 — Arquitetura de Dados e Infraestrutura AWS

Data Lake com processamento ETL e consultas analíticas.

**Tecnologias:** RDS PostgreSQL · AWS Glue · Amazon Athena · S3 Data Lake · VPC

**Camadas do Data Lake:**
```
S3 Data Lake
├── raw/        ← Dados brutos dos sensores (JSON)
├── processed/  ← Dados normalizados (Parquet)
└── reports/    ← Relatórios gerados
```

**ETL (Glue Job Python):**
- Leitura do RDS (dados quentes — últimas 24h)
- Transformação e enriquecimento
- Escrita em Parquet no S3 (dados frios)
- Catálogo automático via AWS Glue Catalog

**Schema do Banco (PostgreSQL):**
```sql
devices    -- Cadastro de medidores e sensores
readings   -- Leituras históricas (time-series)
alerts     -- Alarmes e notificações
```

---

### Módulo 4 — Interface Web

Dashboard web responsivo com dados em tempo real.

**Tecnologias:** React 18 · TypeScript · Vite 5 · Recharts · React Query · React Router

**Páginas:**

| Rota | Página | Descrição |
|------|--------|-----------|
| `/dashboard` | Painel Inicial | Resumo de energia com KPIs e gráficos |
| `/energia` | Energia | Parâmetros elétricos detalhados |
| `/agua` | Água | Consumo hídrico e histórico |
| `/nivel` | Nível | Reservatórios e combustível |
| `/status-medidores` | Status | 38 medidores com filtros |

**Estrutura do Frontend:**
```
frontend/src/
├── components/
│   ├── Layout/          # Sidebar + PageHeader
│   ├── PainelInicial/   # Dashboard principal
│   ├── Energia/         # Página de energia
│   ├── Agua/            # Página de água
│   ├── Nivel/           # Página de nível
│   └── StatusMedidores/ # Status dos dispositivos
├── contexts/
│   └── AuthContext.tsx  # Autenticação (Mock/Cognito)
├── hooks/
│   └── useDeviceReadings.ts  # React Query hooks
├── services/
│   └── apiClient.ts     # Axios + interceptor JWT
└── types/
    └── index.ts         # Interfaces TypeScript
```

**Infraestrutura (Terraform):**
```
infra/terraform/
├── s3_frontend.tf   # Bucket S3 para hospedagem
├── cloudfront.tf    # CDN com HTTPS e WAF
└── variables.tf
```

---

## Como Executar Localmente

### Pré-requisitos
- Node.js 18+ ([nodejs.org](https://nodejs.org))
- npm 9+
- Git

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/patrick9kk/dna-automacao-web.git
cd dna-automacao-web

# 2. Entre na pasta do frontend
cd "Módulo 4 - Interface Web/frontend"

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: **http://localhost:5173**

**Credenciais de demonstração:**
```
Usuário: Patrick
Senha:   1234
```

---

## Deploy

### Vercel (recomendado para apresentações)

```bash
cd "Módulo 4 - Interface Web/frontend"
npm install -g vercel
vercel --prod
```

### AWS S3 + CloudFront (produção)

```bash
# Build
npm run build

# Upload para S3
aws s3 sync dist/ s3://dna-automacao-web/ --delete

# Invalidar cache CloudFront
aws cloudfront create-invalidation \
  --distribution-id SEU_ID \
  --paths "/*"
```

### Terraform (infraestrutura completa)

```bash
cd "Módulo 4 - Interface Web/infra/terraform"
cp terraform.tfvars.example terraform.tfvars
# Edite terraform.tfvars com suas configurações AWS

terraform init
terraform plan
terraform apply
```

---

## Estrutura de Dados

### API — Medidores `/api/devices`
```json
{
  "device_id": "SM3W-SESC-SEDE-1",
  "name": "Medidor Energia Geral",
  "type": "Energia",
  "area": "DNA - SESC Sede",
  "status": "Online",
  "last_seen": "2026-05-21T21:02:29Z"
}
```

### API — Leituras de Energia `/api/readings/energia`
```json
{
  "device_id": "SM3W-SESC-SEDE-1",
  "summary": {
    "total_kwh": 85010,
    "peak_kwh": 124322,
    "peak_timestamp": "2026-05-14T09:52:41Z"
  },
  "parameters": {
    "corrente_a": 76.00,
    "corrente_b": 85.00,
    "corrente_c": 95.00,
    "fator_potencia": 0.97
  }
}
```

### API — Nível `/api/readings/nivel`
```json
{
  "device_id": "SM3EA-SESC-SEDE-1",
  "capacity_liters": 300,
  "current_level_pct": 98.05,
  "current_volume_liters": 294.15
}
```

---

## Medidores Monitorados — SESC Sede

O sistema monitora **38 dispositivos** no SESC Sede, incluindo:

| Tipo | Qtd | Exemplos |
|------|-----|---------|
| Gateway | 1 | GATEWAY 01 SESC-SEDE |
| Energia | 2 | Medidor Energia Geral, Medidor Energia Gerador |
| Água | 1 | Medidor Água Geral |
| Reservatório | 2 | Nivel combustivel Gerador, Reserv. Potável |
| Liga/Desliga | 32 | Gerador, Bombas INC, Bombas HVAC, Chillers |

---

## Variáveis de Ambiente

Copie o arquivo de exemplo e configure:

```bash
cp "Módulo 4 - Interface Web/frontend/.env.example" \
   "Módulo 4 - Interface Web/frontend/.env"
```

```env
# AWS Cognito (produção)
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_COGNITO_REGION=us-east-1

# API Backend
VITE_API_URL=https://api.dnafacilities.com.br

# Modo mock (desenvolvimento local)
VITE_MOCK_MODE=true
```

---

## Tecnologias Utilizadas

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| React | 18 | Framework UI |
| TypeScript | 5 | Tipagem estática |
| Vite | 5 | Build tool |
| React Router | 6 | Navegação SPA |
| React Query | 5 | Cache e polling de dados |
| Recharts | 2 | Gráficos (linha, barra) |
| Axios | 1 | HTTP client com interceptor JWT |
| Day.js | 1 | Formatação de datas |

### Backend / Infraestrutura
| Serviço | Uso |
|---|---|
| AWS Lambda (Python 3.11) | Processamento serverless |
| Amazon API Gateway | Endpoints REST |
| Amazon Cognito | Autenticação e autorização |
| Amazon RDS PostgreSQL | Banco de dados relacional |
| AWS Glue | ETL e catálogo de dados |
| Amazon Athena | Consultas analíticas S3 |
| Amazon S3 | Data lake e hospedagem frontend |
| Amazon CloudFront | CDN com HTTPS |
| AWS WAF | Proteção contra ataques |
| Amazon SQS | Filas assíncronas |
| Terraform | Infraestrutura como código |

---

## Documentação Técnica

Cada módulo possui documentação técnica completa em `.docx`:

- 📄 `Módulo 1/docs/Especificacao_Tecnica_Modulo1_v1.0.docx`
- 📄 `Módulo 2/docs/Especificacao_Tecnica_Modulo2_v1.0.docx`
- 📄 `Módulo 3/docs/Especificacao_Tecnica_Modulo3_v1.0.docx`
- 📄 `Módulo 4/docs/Especificacao_Tecnica_Modulo4_v1.0.docx`

---

## Roadmap

- [x] Módulo 1 — Extração e Exportação de Dados
- [x] Módulo 2 — Governança, Segurança e Controle de Acesso
- [x] Módulo 3 — Arquitetura de Dados e Infraestrutura AWS
- [x] Módulo 4 — Interface Web (Dashboard)
- [ ] Módulo 5 — Alarmes e Notificações em Tempo Real
- [ ] Módulo 6 — Manutenção Preventiva e Chamados
- [ ] Módulo 7 — Relatórios Gerenciais e SLA
- [ ] App Mobile (React Native)

---

## Licença

Projeto proprietário — **DNA Facilities © 2026**  
Todos os direitos reservados.

---

*Desenvolvido com Claude AI + AWS + React*
