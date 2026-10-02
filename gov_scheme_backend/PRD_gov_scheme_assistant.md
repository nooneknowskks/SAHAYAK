# Product Requirements Document (PRD)
## AI-Powered Government Scheme Assistant

| Field | Value |
|---|---|
| **Project Name** | AI-Powered Government Scheme Assistant |
| **Document Version** | 1.0 |
| **Date** | 2026-03-28 |
| **Status** | Draft |
| **Language** | English / Hindi / Marathi |

---

## 1. Executive Summary

The AI-Powered Government Scheme Assistant is a full-stack web application that bridges the gap between Indian citizens and government welfare schemes. Citizens currently struggle to discover schemes they are eligible for due to complex eligibility criteria, language barriers, and scattered information sources. This product provides a unified, intelligent platform where users can describe their profile or ask a natural-language question and instantly receive a curated list of applicable government schemes with full details on benefits, required documents, and application links.

---

## 2. Problem Statement

> Citizens find it difficult to identify eligible government welfare schemes due to complex criteria and language barriers.

Key pain points identified:
- **Information overload**: Hundreds of central and state-level schemes exist, each with different eligibility rules.
- **Language barrier**: Most scheme information is available only in English; rural beneficiaries speak Hindi/Marathi.
- **Accessibility gap**: No single interface aggregates and filters schemes by a user's personal profile.
- **Process opacity**: Users don't know what documents are needed or how to apply.

---

## 3. Product Goals & Success Metrics

### Goals
1. Allow any citizen to find eligible government schemes in under 60 seconds.
2. Support natural-language queries so no technical knowledge is required.
3. Provide multilingual output (English, Hindi, Marathi).
4. Expose a clean REST API so the backend can be integrated with other platforms (e.g., mobile apps, WhatsApp bots).

### Success Metrics
| Metric | Target |
|---|---|
| Eligibility check response time | < 500 ms |
| Schemes returned per query | Top 5 best matches |
| Language support | English + Hindi + Marathi |
| API reliability | 99% uptime |
| Data coverage | All schemes in [schemes.json](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/data/schemes.json) / [schemes_data.csv](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/data/schemes_data.csv) |

---

## 4. User Personas

### Persona 1 – Ramesh (Farmer, Rural Maharashtra)
- Age: 42, income: ₹80,000/year, state: Maharashtra
- Speaks Marathi, low digital literacy
- Goal: Find crop subsidy and irrigation schemes
- Barrier: Cannot navigate complex government portals

### Persona 2 – Priya (Female Student, Urban Gujarat)
- Age: 20, income: ₹0 (dependent), state: Gujarat
- Speaks Hindi and English
- Goal: Find scholarship schemes for higher education
- Barrier: Doesn't know which scholarships she qualifies for

### Persona 3 – Arjun (Small Business Owner, Karnataka)
- Age: 35, income: ₹3,00,000/year, state: Karnataka
- Speaks English
- Goal: Find MSME startup/loan schemes
- Barrier: Time-consuming to research each scheme manually

---

## 5. Scope

### In Scope (Current Version)
- Eligibility checking based on age, income, state, and category
- Keyword-based NLP query parsing (no external AI model)
- Scheme recommendation with scoring
- Natural-language question answering (chatbot-style)
- Detailed scheme explanation (benefits, documents, how-to-apply)
- Multilingual UI support (English, Hindi, Marathi)
- REST API for all backend features

### Out of Scope (Future Versions)
- Real AI/LLM integration (e.g., Gemini, GPT)
- User authentication and saved profiles
- Mobile native apps
- Admin portal for managing schemes
- Real-time scheme data from government APIs

---

## 6. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                       FRONTEND                          │
│  React SPA (frontend/)     HTML/CSS/JS (index.html)     │
│  Port: 3000 (CRA)          Port: 5500 (http.server)     │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP REST calls
         ┌───────────┴──────────────────┐
         │                              │
┌────────▼────────────┐    ┌────────────▼─────────────┐
│  Node.js / Express  │    │    FastAPI (Python)       │
│  server.js          │    │    app/main.py            │
│  Port: 5000         │    │    Port: 8000             │
│                     │    │                           │
│  /api/schemes       │    │  GET  /schemes            │
│  /api/search        │    │  POST /check-eligibility  │
│  /api/recommend     │    │  POST /ask                │
│  /api/ask           │    │                           │
│  /api/explain/:name │    └────────────┬─────────────┘
└────────┬────────────┘                 │
         │                             │
         └─────────────┬───────────────┘
                       │
              ┌────────▼────────────┐
              │    DATA LAYER       │
              │  data/schemes.json  │  (~13 MB, primary)
              │  data/schemes_data  │
              │       .csv          │  (~12 MB, raw source)
              └─────────────────────┘
```

> **Dual-backend architecture**: The project has two independent backends:
> - **Node.js/Express** ([server.js](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/server.js)): Feature-rich backend with NLP, scoring, recommendation, and explanation APIs.
> - **FastAPI (Python)** ([app/main.py](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/app/main.py)): Stricter schema-validated backend with hard eligibility filtering and chatbot endpoint.

---

## 7. Data Model

### 7.1 Scheme Object (as used in Node.js backend — [schemes.json](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/data/schemes.json))

| Field | Type | Description |
|---|---|---|
| `scheme_name` | string | Full name of the scheme |
| `details` | string | Description of the scheme |
| `benefits` | string | What the beneficiary receives |
| [eligibility](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/app/main.py#61-67) | string | Eligibility criteria (free text) |
| `documents` | string / array | Required documents |
| `application` | string | How-to-apply instructions |
| `tags` | array | Occupation/category tags |
| `levels` | string | Central / State level |
| `Income_Limit` | number | Maximum income for eligibility |

### 7.2 Scheme Object (as used in FastAPI backend — [schemas.py](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/app/schemas.py))

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique scheme ID (e.g., SCH001) |
| `name` | string | Scheme name |
| `state` | string | State or `"All"` for central schemes |
| `min_age` | int | Minimum age to apply |
| `max_income` | int \| null | Maximum annual income; `null` = no limit |
| `category` | string | Target group (Farmer, Student, Women, etc.) |
| `documents` | List[string] | Required documents |
| `benefits` | string | Benefits description |
| `apply_link` | string | URL to official apply page |

### 7.3 User Profile ([schemas.py](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/app/schemas.py) — [UserProfile](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/app/schemas.py#15-21))

| Field | Type | Description |
|---|---|---|
| `name` | string | User's name |
| `age` | int | User's age |
| `income` | int | Annual income in ₹ |
| `state` | string | State of residence |
| `category` | string | Category: Farmer / Student / Women / General |

### 7.4 Chat Request ([schemas.py](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/app/schemas.py) — [ChatRequest](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/app/schemas.py#22-24))

| Field | Type | Description |
|---|---|---|
| [question](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/app/main.py#68-104) | string | Natural language question from the user |

---

## 8. Feature Specifications

### Feature 1: Eligibility Checker (FastAPI)

**Endpoint**: `POST /check-eligibility`  
**Request Body**: [UserProfile](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/app/schemas.py#15-21) JSON  
**Logic**:
1. Filter schemes where `user.age >= scheme.min_age`
2. Filter schemes where `user.income <= scheme.max_income` (skip check if `max_income` is null)
3. Filter schemes where `scheme.state == "All"` OR `scheme.state == user.state` (case-insensitive)
4. Filter schemes where `scheme.category == "All"` OR `scheme.category == user.category` (case-insensitive)

**Response Example**:
```json
{
  "eligible_schemes": [
    {
      "id": "SCH001",
      "name": "PM Kisan",
      "state": "All",
      "min_age": 18,
      "max_income": null,
      "category": "Farmer",
      "documents": ["Aadhaar Card", "Landholding papers"],
      "benefits": "₹6000 per year",
      "apply_link": "https://pmkisan.gov.in"
    }
  ]
}
```

---

### Feature 2: Scheme Recommender with Scoring (Node.js)

**Endpoint**: `GET /api/recommend?occupation=farmer&state=maharashtra&income=50000&gender=male`

**Scoring Algorithm**:
| Match Type | Points |
|---|---|
| Occupation keyword match | +4 per keyword hit |
| State match | +3 |
| Gender match | +2 |
| Income within limit | +2 |

**Response**:
```json
{
  "bestMatches": [ /* top 5 schemes sorted by score */ ],
  "recommended": [ /* schemes ranked 6–20 */ ],
  "allSchemes": [ /* all schemes with scores */ ]
}
```

Each scheme in the response includes:
- All scheme fields
- `score` (integer, computed relevance score)
- [eligibility](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/app/main.py#61-67) object with `{ eligible: boolean, reasons: string[] }`

---

### Feature 3: Natural Language Query (Node.js)

**Endpoint**: `GET /api/ask?q=I+am+a+farmer+from+maharashtra`

**NLP Entity Extraction** ([extractUserInfo()](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/server.js#27-72)):
| Entity | Detection Method |
|---|---|
| Occupation | Keyword lookup: `farmer`, `agriculture`, `kisan`, `student`, `business`, `women`, etc. |
| State | List match: `maharashtra`, `gujarat`, `rajasthan`, `bihar`, `madhya pradesh`, `uttar pradesh`, `karnataka`, `tamil nadu` |
| Gender | Keywords: `women`, `female`, `mahila` |

**Response**:
```json
{
  "question": "I am a farmer from maharashtra",
  "detectedUser": {
    "occupation": "farmer",
    "state": "maharashtra",
    "gender": "",
    "income": 0
  },
  "topSchemes": [ /* top 5 ranked schemes */ ]
}
```

---

### Feature 4: Chatbot Q&A (FastAPI)

**Endpoint**: `POST /ask`  
**Request Body**: `{ "question": "schemes for women" }`

**Rule-based parsing**:
| Keyword in question | Extracted Category |
|---|---|
| `student` | Student, age=20 |
| `women`, `woman`, `girl` | Women |
| `farmer`, `farm` | Farmer |
| (default) | General, age=25, income=50000, state=Maharashtra |

**Response**:
```json
{
  "reply": "Based on your question, you may be eligible for these schemes: PM Kisan, ..."
}
```
or
```json
{ "reply": "Sorry, no schemes found for your profile." }
```

---

### Feature 5: Scheme Search (Node.js)

**Endpoint**: `GET /api/search?q=PM Kisan`

- Full-text search across the entire JSON-serialised scheme object
- Case-insensitive string matching
- Returns all matching scheme objects

---

### Feature 6: Scheme Explainer (Node.js)

**Endpoint**: `GET /api/explain/:schemeName?occupation=farmer&state=maharashtra&income=50000`

- Finds the first scheme whose serialised JSON contains `schemeName` (case-insensitive)
- Returns a structured explanation including:
  - [scheme](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/app/main.py#30-33) (name)
  - `details` (description)
  - `benefits`
  - [eligibility](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/app/main.py#61-67)
  - `documents`
  - `howToApply`
  - `whyRecommended` (personalised reasons based on the user query params)

---

### Feature 7: Multilingual UI

The frontend supports 3 languages:
- [en](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/server.js#140-173) – English
- `hi` – Hindi
- `mr` – Marathi

Users select the language from a dropdown. The UI labels, results, and messages are displayed in the selected language.

---

## 9. API Reference Summary

### Node.js / Express Server ([server.js](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/server.js)) — Port 5000

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/api/schemes` | Return all schemes |
| GET | `/api/search?q=` | Full-text search |
| GET | `/api/recommend?occupation=&state=&income=&gender=` | Scored recommendation |
| GET | `/api/ask?q=` | NLP query + recommendation |
| GET | `/api/explain/:schemeName?occupation=&state=&income=` | Detailed scheme explanation |

### FastAPI (Python) — Port 8000

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/schemes` | Return all schemes |
| POST | `/check-eligibility` | Hard eligibility filter |
| POST | `/ask` | Chatbot-style Q&A |

---

## 10. Frontend Requirements

### 10.1 React SPA (`frontend/`)

**Tech Stack**: React (Create React App), plain CSS  
**Entry**: [frontend/src/index.js](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/frontend/src/index.js) → [App.js](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/frontend/src/App.js)

**Current UI Components (MVP)**:
- Text input: `Occupation`
- Text input: `State`
- Text input: `Income`
- Button: `Find Schemes`
- Results list: scheme name + 120-character preview

**API Integration**:
```
GET http://localhost:5000/api/recommend?occupation=<val>&state=<val>&income=<val>
```

### 10.2 Planned UI Features (from README)
- Name, Age, Gender fields
- Category selector (Farmer / Student / Women / Entrepreneur)
- Language selector (English / Hindi / Marathi)
- Full scheme cards showing: name, benefits, required documents, apply link
- Natural language search bar

---

## 11. Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Node.js Backend | Express.js | ^5.2.1 |
| Python Backend | FastAPI | 0.133.1 |
| Python Runtime | Python | 3.7+ |
| ASGI Server | Uvicorn | 0.41.0 |
| Data Validation | Pydantic | 2.12.5 |
| Frontend | React | (Create React App) |
| HTTP Client | Axios | ^1.13.6 |
| Data Format | JSON / CSV | — |
| Data Processing | csv-parser, xlsx | — |
| CORS | cors (npm) / FastAPI CORSMiddleware | — |
| Web Scraping (utility) | Cheerio, xml2js | — |

---

## 12. Data Pipeline

```
Raw Source (CSV/Excel)
        │
        ├── convertCSV.js   → converts CSV to usable format
        ├── readCSV.js      → reads and logs CSV rows
        └── readExcel.js    → reads Excel files
                │
                ▼
        data/schemes_data.csv   (12.2 MB raw data)
                │
                ▼
        data/schemes.json       (13 MB, primary data store)
                │
        ┌───────┴───────┐
        │               │
   server.js       app/main.py
 (loaded once      (loaded once
 at startup)       at startup)
```

> **Note**: The `scheme_project/` directory exists but is currently empty. It may be intended for a future standalone project or migration.

---

## 13. Non-Functional Requirements

### 13.1 Performance
- Both backends load [schemes.json](file:///c:/Users/vedan/OneDrive/Documents/gov_scheme_backend/data/schemes.json) once at startup into memory. All queries are in-memory (O(n) scan). Acceptable for current data size (~13 MB, ~thousands of schemes).
- Target API response time: **< 500 ms** for all endpoints.

### 13.2 Security
- CORS is configured as wildcard (`*`) — suitable for development; must be restricted to allowed origins in production.
- No authentication is currently implemented. All endpoints are publicly accessible.
- No sensitive user data is stored (stateless API).

### 13.3 Reliability
- Both backends must be started independently. No orchestration (Docker/PM2) is currently used.
- No automated tests exist yet (noted in README).

### 13.4 Scalability
- Current in-memory approach is sufficient for MVP. For production scale (millions of users), the JSON should be migrated to a database (PostgreSQL / MongoDB / Elasticsearch).

### 13.5 Accessibility
- Multilingual support (English, Hindi, Marathi) addresses regional accessibility.
- UI should follow WCAG 2.1 AA guidelines in future versions.

---

## 14. Current Limitations & Known Issues

| # | Limitation | Impact | Priority |
|---|---|---|---|
| 1 | NLP is rule-based (keyword match only); no true AI | Misses nuanced queries | High |
| 2 | Only 8 Indian states are recognized in NLP extraction | Many states ignored | High |
| 3 | Income extraction from NLP query is not implemented | Income always defaults to 0 | Medium |
| 4 | Frontend React app is MVP-only (3 inputs, no styling) | Poor UX | High |
| 5 | Two backends (Express + FastAPI) are not unified | Redundant logic, harder maintenance | Medium |
| 6 | CORS wildcard (`*`) in production | Security risk | High |
| 7 | No automated tests | Regression risk | Medium |
| 8 | Data is loaded from a static JSON file | Stale data, no CMS or admin UI | Low |
| 9 | Chatbot defaults to Maharashtra state | Wrong results for other states | Medium |
| 10 | No pagination on `/api/schemes` or `/api/search` | Response can be >13 MB | High |

---

## 15. Future Roadmap

### Phase 2 – AI Integration
- Integrate Google Gemini API for true natural language understanding
- Extract user profile attributes (age, income, state, category) from freeform text
- Generate human-friendly explanations of schemes in all three languages

### Phase 3 – User Accounts
- User registration and login (email/OTP)
- Save profile; persist eligible schemes history
- Bookmark / favourite schemes

### Phase 4 – Admin Portal
- CRUD interface for managing scheme data
- Bulk import from government data portals (e.g., MyScheme API)
- Approval workflow for new schemes

### Phase 5 – Mobile & WhatsApp
- React Native mobile app
- WhatsApp chatbot integration using Twilio / Meta Cloud API
- Voice input support for low-literacy users

### Phase 6 – Production Infrastructure
- Containerize with Docker
- Deploy on cloud (GCP / AWS / Azure)
- Database migration: JSON → PostgreSQL + Elasticsearch for fast search
- CI/CD pipeline with GitHub Actions

---

## 16. File Structure Reference

```
gov_scheme_backend/
├── server.js              # Node.js/Express backend (PORT 5000)
├── app.js                 # Prototype React component (standalone)
├── package.json           # Node.js dependencies
├── requirements.txt       # Python dependencies
├── index.html             # Placeholder HTML
├── convertCSV.js          # Utility: CSV → JSON converter
├── readCSV.js             # Utility: CSV reader/logger
├── readExcel.js           # Utility: Excel reader
├── README.md              # Project documentation
│
├── app/                   # FastAPI Python backend (PORT 8000)
│   ├── main.py            # FastAPI app: /check-eligibility, /ask, /schemes
│   └── schemas.py         # Pydantic models: Scheme, UserProfile, ChatRequest
│
├── data/                  # Data layer
│   ├── schemes.json       # Primary scheme dataset (~13 MB)
│   └── schemes_data.csv   # Raw CSV source (~12 MB)
│
├── frontend/              # React SPA
│   ├── public/
│   │   └── index.html     # HTML shell
│   └── src/
│       ├── App.js         # Main component (occupation, state, income search)
│       ├── App.css        # Basic styles
│       └── index.js       # React entry point
│
├── scheme_project/        # Empty — reserved for future use
└── venv/                  # Python virtual environment
```

---

## 17. Glossary

| Term | Definition |
|---|---|
| **Scheme** | A government welfare program offering financial aid, subsidies, or services to eligible citizens |
| **Eligibility Criteria** | Rules determining who qualifies: age, income, state, category, occupation |
| **NLP** | Natural Language Processing — interpreting free-text queries to extract structured intent |
| **FastAPI** | A modern, high-performance Python web framework for building REST APIs |
| **CORS** | Cross-Origin Resource Sharing — security mechanism controlling which domains can call an API |
| **Pydantic** | Python data validation library used to define and validate request/response schemas |
| **CRA** | Create React App — toolchain for bootstrapping React projects |

---

*Document generated by automated codebase analysis on 2026-03-28.*
