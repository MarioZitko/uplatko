# Uplatko

**Generator HUB3 uplatnica za hrvatske freelancere i mala poduzeća.**

Uplatko je web aplikacija koja čita PDF račune, izvlači podatke o plaćanju i generira HUB3/PDF417 barkod koji možeš pozicionirati direktno na PDF ili preuzeti kao sliku. Sve se odvija lokalno u pregledniku — nikakvi podaci se ne šalju na server.

---

## Značajke

- **Učitavanje PDF-a** — drag & drop ili odabir datoteke
- **Automatsko izvlačenje podataka** — regex parser za hrvatska zaglavlja računa (IBAN, iznos, poziv na broj, primatelj)
- **AI-potpomognuto čitanje** — opcionalna integracija s Gemini ili Groq API-jem za pouzdanije parsiranje
- **Uređivanje polja** — forma za provjeru i ispravak izvučenih podataka
- **Generiranje HUB3 barkoda** — PDF417 barkod sukladan HUB3A standardu
- **Pozicioniranje drag & drop** — postavi barkod na željenu poziciju na PDF stranici
- **Promjena veličine** — povuci ugao za prilagodbu veličine barkoda (radi i na mobitelu)
- **Preuzimanje** — PDF s ugrađenim barkodom ili barkod kao PNG
- **Tamni način rada** — automatski prati sistemske postavke, ručna promjena gumbom
- **Privatnost** — svi podaci ostaju u pregledniku, API ključevi se čuvaju samo u localStorage

---

## Tehnologije

| Paket                   | Svrha                                      |
| ----------------------- | ------------------------------------------ |
| React + TypeScript      | UI framework                               |
| Vite                    | Build alat                                 |
| shadcn/ui + Tailwind v4 | Komponente i stilizacija                   |
| next-themes             | Tamni način rada                           |
| sonner                  | Toast obavijesti                           |
| pdfjs-dist              | Čitanje i renderiranje PDF-a u pregledniku |
| pdf-lib                 | Ugrađivanje barkoda u PDF                  |
| bwip-js                 | Generiranje PDF417 barkoda                 |
| react-hook-form + zod   | Validacija forme                           |

---

## Pokretanje lokalno

```bash
# Kloniraj repozitorij
git clone https://github.com/MarioZitko/uplatko.git
cd uplatko

# Instaliraj ovisnosti
pnpm install

# Pokreni razvojni server
pnpm dev
```

Aplikacija će biti dostupna na `http://localhost:5173`.

---

## AI čitanje (opcionalno)

Regex parser je best-effort rješenje — layout računa se razlikuje po sustavu. Za bolje rezultate možeš koristiti jedan od besplatnih AI servisa:

### Groq (preporučeno)

1. Stvori besplatni račun na [console.groq.com](https://console.groq.com)
2. Generiraj API ključ
3. U aplikaciji otvori **Postavke** (ikona zupčanika) → unesi ključ pod Groq → odaberi Groq kao aktivni servis

Koristi model `llama-3.3-70b-versatile`. Besplatno, bez kreditne kartice.

### Google Gemini

1. Stvori API ključ na [aistudio.google.com](https://aistudio.google.com/app/apikey)
2. U aplikaciji otvori **Postavke** → unesi ključ pod Gemini → odaberi Gemini kao aktivni servis

---

## HUB3 standard

Barkod string slijedi točnu strukturu HUB3A specifikacije:

```
HRVHUB30
EUR
000000000001000   ← 15 znamenki (10.00 EUR)
Ime platitelja
Adresa platitelja
Grad platitelja
Ime primatelja
Adresa primatelja
Grad primatelja
HR1234567890123456789
HR68
123-456-789
OTHR
Opis plaćanja
```

---

## Struktura projekta

```
src/
├── components/
│   ├── ui/                    # shadcn komponente
│   ├── BarcodePreview.tsx     # Pregled barkoda (prezentacijska komponenta)
│   ├── LlmSettingsDialog.tsx  # Postavke AI providera
│   ├── PaymentForm.tsx        # Forma za uređivanje podataka
│   ├── PdfCanvas.tsx          # PDF prikaz + drag & drop pozicioniranje
│   └── PdfUploader.tsx        # Upload i pokretanje parsiranja
├── hooks/
│   ├── useDraggable.ts        # Drag & drop logika
│   ├── usePdfCanvas.ts        # PDF rendering, barcode učitavanje, export
│   ├── usePdfParser.ts        # Orchestracija parsiranja (regex + AI fallback)
│   └── useResizable.ts        # Resize logika s touch podrškom
├── lib/
│   ├── download.ts            # Blob download helpers
│   ├── llmStorage.ts          # localStorage za API ključeve
│   └── pdfWorker.ts           # pdfjs worker setup
├── modules/
│   ├── barcodeGenerator.ts    # PDF417 generiranje (bwip-js)
│   ├── geminiParser.ts        # Gemini API integracija
│   ├── groqParser.ts          # Groq API integracija
│   ├── hub3Formatter.ts       # HUB3 string builder + sanitizacija
│   ├── pdfExporter.ts         # Ugrađivanje barkoda u PDF (pdf-lib)
│   └── pdfParser.ts           # Regex parser za hrvatska zaglavlja
└── types/
    └── hub3.ts                # Hub3Data, ParsedPdfFields, PURPOSE_CODES
```

---

## Poznata ograničenja

- PDF parsiranje je best-effort — layout računa varira između sustava (Sol, eRačun, itd.), polja uvijek treba provjeriti
- Podržana je samo prva stranica PDF-a
- Gemini besplatni tier ima dnevne limite koji se mogu brzo iscrpiti
- API ključevi se čuvaju u localStorage — izloženi su XSS napadima; koristiti ograničene ključeve (npr. Gemini ključeve skopane na domenu)

---

## Licenca

MIT
