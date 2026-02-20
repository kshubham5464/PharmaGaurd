# PharmaGuard

<div align="center">

![PharmaGuard](https://img.shields.io/badge/PharmaGuard-Pharmacogenomics%20Platform-00f5d4?style=for-the-badge&logo=dna)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)

**A clinical-grade pharmacogenomics decision-support platform for personalised drug safety.**  
PharmaGuard analyses patient genetic profiles (via VCF files or manual entry) against CPIC guidelines to predict drug adverse reactions before prescribing.

[Features](#features) · [Architecture](#system-architecture) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started) · [API Reference](#api-reference) · [Genomics Engine](#pharmacogenomics-engine)

</div>

---

## What is PharmaGuard?

PharmaGuard helps clinicians and pharmacists prevent adverse drug reactions by integrating a patient's genetic profile with evidence-based CPIC (Clinical Pharmacogenomics Implementation Consortium) guidelines. Doctors upload a VCF (Variant Call Format) genetic file or enter gene variants manually. The system then:

1. Parses the VCF — using the **GT (Genotype) field as the sole source of biological truth**
2. Determines each gene's diplotype (e.g. `*1/*2` for CYP2C19)
3. Derives the metabolizer phenotype
4. Looks up CPIC drug-gene interactions
5. Generates a risk report with dosing recommendations

---

## Features

| Category | Features |
|----------|----------|
| 🧬 **Genomics** | VCF file upload & parsing, manual gene entry, GT-based diplotype inference, 7 pharmacogenes supported |
| 💊 **Risk Analysis** | CPIC-level recommendations, drug-gene interaction lookup, risk level classification (High / Moderate / Low) |
| 👤 **Patient Management** | Full patient CRUD, clinical history, genetic profile per patient, analysis history timeline |
| 📊 **Dashboard** | Real-time stats (patients, high-risk count, safe analyses), risk distribution bar chart, recent alerts feed |
| 📄 **Reports** | Historical report browser, per-patient analysis timeline, PDF-exportable summaries |
| 🔒 **Security** | Supabase Auth (email/password), Row-Level Security on all tables, JWT-protected backend API |
| 🎨 **UI/UX** | Glassmorphism design, dark/light theme toggle, fully responsive (mobile-first), Framer Motion animations |
| 🐳 **DevOps** | Docker Compose support, environment-based configuration |

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           BROWSER / CLIENT                           │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                   React SPA  (Vite + TypeScript)             │    │
│  │                                                               │    │
│  │  ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐  │    │
│  │  │  Auth Pages   │  │  Protected Pages  │  │  Sidebar /   │  │    │
│  │  │  (Login /     │  │  (Dashboard,      │  │  Layout /    │  │    │
│  │  │   Register)   │  │   Patients,       │  │  PageTrans-  │  │    │
│  │  └──────┬────────┘  │   Analysis,       │  │  ition)      │  │    │
│  │         │            │   Reports, etc.)  │  └──────────────┘  │    │
│  │         │            └────────┬──────────┘                     │    │
│  └─────────┼─────────────────────┼──────────────────────────────┘    │
│            │                     │                                     │
└────────────┼─────────────────────┼─────────────────────────────────┘
             │                     │
             ▼                     ▼
┌────────────────────┐   ┌─────────────────────────────────────────┐
│   Supabase Auth    │   │              Express API                 │
│   (JWT Tokens)     │   │           (Node.js  Port 3000)           │
│   ─────────────    │   │                                           │
│   ✓ Sign up        │   │  POST /upload/vcf   ← VCF Parser         │
│   ✓ Sign in        │   │  GET  /patients     ← Patient List       │
│   ✓ Sessions       │   │  POST /patients     ← Create Patient     │
│   ✓ RLS Tokens     │   │                                           │
└────────┬───────────┘   └────────────────┬────────────────────────┘
         │                                │
         │                                │
         ▼                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                         Supabase (PostgreSQL)                      │
│                                                                    │
│  ┌────────────┐  ┌───────────────┐  ┌──────────────────────────┐ │
│  │  profiles  │  │   patients    │  │      gene_profiles        │ │
│  │ ─────────  │  │ ──────────    │  │ ─────────────────────     │ │
│  │ id (FK to  │  │ id            │  │ id                        │ │
│  │  auth.users│  │ name          │  │ patient_id (FK)           │ │
│  │ full_name  │  │ age           │  │ gene_name  (e.g. CYP2C19) │ │
│  │ role       │  │ gender        │  │ variant    (e.g. *1/*2)   │ │
│  └────────────┘  │ condition     │  │ metabolizer_type           │ │
│                  │ medical_hist  │  └──────────────────────────-┘ │
│                  │ prescribed_   │                                  │
│                  │   drug        │  ┌──────────────────────────┐  │
│                  │ doctor_id(FK) │  │        analyses           │  │
│                  └───────────────┘  │ ─────────────────────    │  │
│                                     │ id                        │  │
│   Row Level Security ON ALL TABLES  │ patient_id (FK)           │  │
│   ─ Doctors see only their patients │ drug_name                 │  │
│   ─ Inserts require valid JWT       │ risk_level                │  │
│                                     │ phenotype                 │  │
│                                     │ explanation               │  │
│                                     │ alternative_drug          │  │
│                                     │ created_at                │  │
│                                     └──────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

### Pharmacogenomics Engine — Data Flow

```
  VCF File Upload
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  uploadController.ts  —  VCF Parser                   │
│                                                        │
│  For each data line in the VCF:                       │
│    1.  Extract columns  [CHROM, POS, ID, REF, ALT,   │
│                          QUAL, FILTER, INFO, FORMAT,  │
│                          SAMPLE]                       │
│    2.  Parse FORMAT column → find GT field index      │
│    3.  Extract GT from SAMPLE using that index        │
│    4.  Compute copies = gtToCopies(GT)                │
│          GT = 0/0 → copies = 0  → ❌ SKIP            │
│          GT = 0/1 → copies = 1  → ✅ ONE allele      │
│          GT = 1/1 → copies = 2  → ✅ TWO alleles     │
│    5.  Parse INFO field → extract GENE= and STAR=    │
│         (STAR is annotation only — GT decides allele  │
│          presence, NOT INFO.STAR)                     │
│    6.  Return VcfVariant[] with copies > 0 only       │
└─────────────────────────┬────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────┐
│  drugRiskEngine.ts  —  buildGeneResults()             │
│                                                        │
│  Two-slot haplotype model per gene:                   │
│    slotA = "*1"  (reference / wildtype)               │
│    slotB = "*1"  (reference / wildtype)               │
│                                                        │
│  For each GT-confirmed variant:                       │
│    copies == 2 →  slotA = slotB = star allele        │
│                    (homozygous: both chromosomes)      │
│    copies == 1 →  fill one empty slot or upgrade      │
│                    less-severe slot (het: one chrom)   │
│                                                        │
│  Slot conflict resolution (if both slots occupied):   │
│    Severity rank:  no_function < decreased_function   │
│                  < normal_function < increased_function│
│    More severe allele always WINS the slot            │
│                                                        │
│  Diplotype = sortBySeverity(slotA, slotB)             │
│  Examples: "*2/*1", "*2/*2", "*17/*1"                 │
└─────────────────────────┬────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────┐
│  derivePhenotype()                                     │
│                                                        │
│  Looks up each allele in ALLELE_FUNCTION map          │
│  Applies CPIC diplotype → phenotype rules:            │
│                                                        │
│  CYP2C19 / CYP2D6 / CYP2C9 / TPMT / DPYD:           │
│    no_func + no_func       → Poor Metabolizer         │
│    no_func + decreased     → Poor Metabolizer         │
│    no_func + normal        → Intermediate Metabolizer  │
│    decreased + decreased   → Intermediate Metabolizer  │
│    increased + normal      → Rapid Metabolizer        │
│    increased + increased   → Ultrarapid Metabolizer   │
│    normal + normal         → Normal Metabolizer        │
│                                                        │
│  SLCO1B1:  no_func×2 → Poor Function                 │
│  VKORC1:   increased → Warfarin Sensitivity scale     │
└─────────────────────────┬────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────┐
│  CPIC_ALERTS lookup                                    │
│                                                        │
│  GeneResult {                                         │
│    gene, diplotype, phenotype,                        │
│    contributing_variants, cpic_level, recommendation  │
│  }                                                    │
│                                                        │
│  → Upserted into gene_profiles table                 │
│  → Returned in API response                          │
└──────────────────────────────────────────────────────┘
```

---

### Frontend Page Map

```
/ (Landing)
├── /login
├── /register
│
└── [Protected — requires Supabase session]
    ├── /dashboard          ← Stats, bar chart, recent alerts
    ├── /patients           ← Patient list (table on desktop, cards on mobile)
    │   ├── /patients/new   ← Register new patient form
    │   └── /patients/:id   ← Patient details: info, gene profiles, analysis history
    ├── /genes/upload       ← VCF file upload → runs PGx engine
    ├── /genes/new          ← Manual gene variant entry
    ├── /analysis           ← Drug-gene interaction lookup for a patient
    ├── /reports            ← Reports history (all analyses)
    ├── /export             ← Export patient data as CSV/JSON
    └── /docs               ← Gene documentation reference (CPIC guidelines)
```

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** + **Vite** | SPA framework, fast HMR dev server |
| **TypeScript** | Type safety across all components |
| **Tailwind CSS** | Utility-first responsive styling |
| **shadcn/ui** | Accessible component primitives |
| **Framer Motion** | Page transitions, staggered animations, sidebar overlay |
| **Recharts** | Dashboard bar charts |
| **React Router v6** | Client-side routing with `ProtectedRoute` wrapper |
| **@supabase/supabase-js** | Auth + direct DB reads (bypasses backend for simple queries) |
| **lucide-react** | Icon library |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** + **Express** | REST API server |
| **TypeScript** | Type-safe service layer |
| **Multer** | VCF file upload handling (multipart/form-data) |
| **@supabase/supabase-js** | Authenticated DB writes (gene_profiles, analyses) |
| **ts-node** / **nodemon** | Dev server with hot reload |
| **swagger-ui-express** | API documentation (OpenAPI) |

### Database & Auth
| Technology | Purpose |
|-----------|---------|
| **Supabase** (PostgreSQL) | Hosted relational database |
| **Supabase Auth** | Email/password sign-up, JWT sessions |
| **Row Level Security (RLS)** | Doctors only access their own patients' data |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| **Docker Compose** | Containerised backend deployment |
| **dotenv** | Environment variable management |

---

## Database Schema

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | FK → `auth.users.id` |
| `full_name` | `text` | |
| `role` | `text` | Default: `'doctor'` |
| `created_at` | `timestamptz` | |

### `patients`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `doctor_id` | `uuid` | FK → `profiles.id` (RLS key) |
| `name` | `text` | |
| `age` | `int` | |
| `gender` | `text` | |
| `condition` | `text` | Diagnosis / indication |
| `medical_history` | `text` | |
| `prescribed_drug` | `text` | Current drug of interest |
| `created_at` | `timestamptz` | |

### `gene_profiles`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `patient_id` | `uuid` | FK → `patients.id` |
| `gene_name` | `text` | e.g. `CYP2C19` |
| `variant` | `text` | Diplotype e.g. `*1/*2` |
| `metabolizer_type` | `text` | e.g. `Intermediate Metabolizer` |
| `created_at` | `timestamptz` | |

### `analyses`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `patient_id` | `uuid` | FK → `patients.id` |
| `drug_name` | `text` | Drug evaluated |
| `risk_level` | `text` | `High` / `Moderate` / `Low` |
| `phenotype` | `text` | e.g. `Poor Metabolizer` |
| `explanation` | `text` | Natural-language summary |
| `alternative_drug` | `text` | Recommended alternative |
| `created_at` | `timestamptz` | |

---

## Supported Pharmacogenes

| Gene | Role | Key Alleles | Drugs Affected |
|------|------|-------------|----------------|
| **CYP2C19** | Metabolism | *1, *2, *3, *4, *5, *17 | Clopidogrel, PPIs (omeprazole), antidepressants |
| **CYP2D6** | Metabolism | *1, *2, *4, *5, *10, *17, *41 | Codeine, tramadol, tamoxifen, antidepressants |
| **CYP2C9** | Metabolism | *1, *2, *3, *5, *6 | Warfarin, NSAIDs, phenytoin |
| **SLCO1B1** | Transport | *1a, *1b, *5, *15 | Simvastatin (myopathy risk) |
| **TPMT** | Metabolism | *1, *2, *3A, *3C | Azathioprine, 6-mercaptopurine |
| **DPYD** | Metabolism | *1, *2A, *13 | 5-Fluorouracil (5-FU), capecitabine |
| **VKORC1** | Sensitivity | -1639G>A | Warfarin sensitivity |

**CPIC Levels:** `1A` (strongest evidence, actionable) · `2A` (moderate evidence) · `B` (supportive)

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **Supabase** project with the tables above created
- (Optional) **Docker** for containerised backend

### 1. Clone the repository

```bash
git clone https://github.com/your-username/pharmaguard.git
cd pharmaguard
```

### 2. Configure environment variables

**Backend** (`backend/.env`):
```env
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

**Frontend** (`frontend/.env`):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://pharmagaurd.onrender.com
```

### 3. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 4. Run in development

```bash
# Terminal 1 — Backend (port 3000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open [[Click Here](https://pharma-gaurd-six.vercel.app/)]

### 5. Docker (backend only)

```bash
docker-compose up --build
```

---

## API Reference

Base URL: `https://pharmagaurd.onrender.com`

> All endpoints that write data require a valid `Authorization: Bearer <supabase-jwt>` header.

### Patients

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/patients` | ✅ | List all patients for the authenticated doctor |
| `POST` | `/patients` | ✅ | Create a new patient record |

### VCF Upload & Analysis

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/upload/vcf` | ✅ | Upload a VCF file; runs PGx engine and stores gene profiles |

**`POST /upload/vcf`** — multipart/form-data:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `vcfFile` | `File` | ✅ | `.vcf` or `.txt` file |
| `patient_id` | `string` | ✅ | UUID of the patient |

**Response:**
```json
{
  "message": "VCF processed successfully",
  "variants_detected": 3,
  "genes_reported": 2,
  "summary": "CYP2C19: *1/*2 → Intermediate Metabolizer (CPIC 1A); CYP2D6: *1/*1 → Normal Metabolizer (CPIC B)",
  "gene_results": [
    {
      "gene": "CYP2C19",
      "diplotype": "*2/*1",
      "phenotype": "Intermediate Metabolizer",
      "contributing_variants": ["*2 (rs4244285, GT=0/1)"],
      "cpic_level": "1A",
      "recommendation": "Consider alternative antiplatelet therapy; reduced clopidogrel efficacy."
    }
  ],
  "data": [...]
}
```

---

## VCF File Format

PharmaGuard expects standard 4.1+ VCF format with the INFO field containing `GENE=` and `STAR=` annotations:

```
##fileformat=VCFv4.1
##INFO=<ID=GENE,Number=1,Type=String,Description="Gene name">
##INFO=<ID=STAR,Number=1,Type=String,Description="Star allele annotation">
#CHROM  POS       ID          REF  ALT  QUAL  FILTER  INFO                    FORMAT  SAMPLE
chr10   94781859  rs4244285   G    A    .     PASS    GENE=CYP2C19;STAR=*2    GT      0/1
chr10   94761900  rs12248560  C    T    .     PASS    GENE=CYP2C19;STAR=*17   GT      0/0
chr22   42524947  rs4149056   T    C    .     PASS    GENE=SLCO1B1;STAR=*5    GT      1/1
```

> ⚠️ **Critical:** The `GT` field is the **only** evidence of allele presence.  
> `GT=0/0` → allele is **absent**, regardless of STAR annotation.  
> `GT=0/1` → **one** copy. `GT=1/1` → **two** copies.

---

## Project Structure

```
pharmaguard/
├── docker-compose.yml
│
├── backend/
│   ├── src/
│   │   ├── app.ts                     # Express app setup (CORS, routes)
│   │   ├── index.ts                   # Server entry point
│   │   ├── controllers/
│   │   │   ├── patientController.ts   # GET/POST /patients
│   │   │   └── uploadController.ts    # VCF parser + upload orchestrator
│   │   ├── routes/
│   │   │   ├── patientRoutes.ts
│   │   │   └── uploadRoutes.ts
│   │   └── services/
│   │       └── drugRiskEngine.ts      # ← Core PGx engine
│   ├── tsconfig.json
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.tsx                    # Routes + ProtectedRoute wrapper
    │   ├── main.tsx
    │   ├── index.css                  # Tailwind + custom animations
    │   ├── components/
    │   │   ├── Layout.tsx             # Sidebar + mobile hamburger overlay
    │   │   ├── Sidebar.tsx            # Animated nav with active indicator
    │   │   ├── PageTransition.tsx     # Framer Motion route transitions
    │   │   ├── theme-provider.tsx     # Dark/light theme context
    │   │   └── ui/
    │   │       └── GlassCard.tsx      # Glassmorphism card component
    │   ├── context/
    │   │   └── AuthContext.tsx        # Supabase session management
    │   ├── services/
    │   │   └── supabase.ts            # Supabase client singleton
    │   └── pages/
    │       ├── LandingPage.tsx
    │       ├── LoginPage.tsx
    │       ├── RegisterPage.tsx
    │       ├── Dashboard.tsx
    │       ├── PatientsPage.tsx
    │       ├── AddPatient.tsx
    │       ├── PatientDetailsPage.tsx
    │       ├── UploadVCFPage.tsx
    │       ├── GeneEntryPage.tsx
    │       ├── AnalysisPage.tsx
    │       ├── ReportsPage.tsx
    │       ├── ExportDataPage.tsx
    │       └── GeneDocumentationPage.tsx
    ├── tailwind.config.js
    ├── vite.config.ts
    └── package.json
```

---

## Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                            │
│                                                               │
│  1. Supabase Auth (JWT)                                      │
│     └─ Every login returns a signed JWT token                │
│     └─ Token expires; refresh tokens rotate automatically    │
│                                                               │
│  2. Row Level Security (PostgreSQL RLS)                      │
│     └─ patients:      doctor_id = auth.uid()                 │
│     └─ gene_profiles: patient must belong to the doctor      │
│     └─ analyses:      patient must belong to the doctor      │
│     └─ No cross-doctor data leakage possible at DB level     │
│                                                               │
│  3. Backend JWT Forwarding                                   │
│     └─ Frontend sends: Authorization: Bearer <jwt>           │
│     └─ Backend creates Supabase client with that JWT         │
│     └─ All DB operations inherit the doctor's RLS identity   │
│     └─ Backend NEVER uses service_role key in responses      │
└─────────────────────────────────────────────────────────────┘
```

---

## Responsive Design

PharmaGuard is fully responsive across all device sizes using a **mobile-first** approach:

- **Mobile (<768 px):** Hamburger menu → sidebar slides in as overlay. Data tables replaced by card lists. Form fields stack vertically. Buttons go full-width.
- **Tablet (768–1024 px):** Two-column grids. Sidebar auto-collapse.
- **Desktop (≥1024 px):** Fixed sidebar, multi-column dashboard grids, full data tables.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

---

## License

MIT © 2026 PharmaGuard. Built for pharmacogenomic decision support.

> **Disclaimer:** PharmaGuard is a decision-support tool. All clinical decisions must be made by qualified healthcare professionals. This software does not constitute medical advice.
