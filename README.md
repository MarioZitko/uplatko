# Uplatko

**Generator HUB-3 barkoda za hrvatske freelancere i mala poduzeća.**

Učitaj PDF račun ili XML e-račun (Fiskalizacija 2.0 / UBL 2.1), provjeri automatski izvučene podatke i preuzmi PDF417 barkod ugrađen direktno u PDF — spreman za skeniranje u m-zabi, PBZ365 ili Erste Netbanking.

🔗 **[uplatko.com](https://uplatko.com)**

---

## Što radi

- **PDF račun → barkod** — PDF.js izvlači tekst, regex ili LLM (Gemini/Groq) parsira podatke
- **XML e-račun → barkod** — parsira UBL 2.1 format (EN 16931 / Fiskalizacija 2.0), kompatibilno s MIKROeRačun, Solo, Relago
- **Ručni unos** — direktno popuni formu bez uploada
- **Drag & drop pozicioniranje** — povuci barkod na željenu poziciju unutar PDF stranice, promjeni veličinu povlačenjem ugla (touch podrška)
- **Preuzmi PDF s barkodom** ili samo barkod kao PNG
- **Tamni/svjetli način rada** — automatski prati sistemske postavke
- **Nula backenda** — svi podaci ostaju lokalno u pregledniku, ništa se ne šalje na server

---

## Tehnologije

| Paket | Svrha |
|---|---|
| React 19 + TypeScript | UI i logika |
| Vite | Build alat |
| Tailwind CSS v4 + shadcn/ui | Komponente i stilizacija |
| PDF.js | Čitanje i renderiranje PDF-a u pregledniku |
| pdf-lib | Ugrađivanje barkoda u PDF |
| bwip-js | Generiranje PDF417 barkoda |
| react-hook-form + zod | Validacija forme |
| next-themes | Tamni način rada |
| sonner | Toast obavijesti |

---

## Pokretanje lokalno

```bash
git clone https://github.com/MarioZitko/uplatko.git
cd uplatko
pnpm install
pnpm dev
```

Aplikacija će biti dostupna na `http://localhost:5173`.

---

## AI čitanje (opcionalno)

Regex parser je best-effort rješenje — layout računa se razlikuje po sustavu. Za preciznije parsiranje koristi jedan od besplatnih AI servisa. U aplikaciji otvori **Postavke** (ikona zupčanika) i unesi API ključ.

**Groq** (preporučeno) — besplatni račun na [console.groq.com](https://console.groq.com), model `llama-3.3-70b-versatile`, bez kreditne kartice.

**Google Gemini** — API ključ na [aistudio.google.com](https://aistudio.google.com/app/apikey).

---

## HUB-3 standard

Barkod string slijedi HUB3A specifikaciju Hrvatske udruge banaka:

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

Podržani modeli: HR00, HR01, HR02, HR04, HR10, HR68, HR99. Prihvaća bilo koji IBAN (ISO 13616).

---

## Struktura projekta

```
src/
├── components/
│   ├── ui/                    # shadcn komponente
│   ├── BarcodeOnlyStep.tsx    # Korak za XML/ručni unos (bez PDF canvasa)
│   ├── BarcodePreview.tsx     # Prikaz generiranog barkoda
│   ├── HowItWorks.tsx         # Upute za korištenje (upload stranica)
│   ├── LlmSettingsDialog.tsx  # Postavke AI providera
│   ├── PaymentForm.tsx        # Forma za provjeru i uređivanje podataka
│   ├── PdfCanvas.tsx          # PDF prikaz + drag & drop pozicioniranje
│   ├── PdfUploader.tsx        # Upload PDF/XML i ručni unos
│   ├── SeoGuide.tsx           # Vodič / SEO sadržaj (accordion)
│   └── SupportSection.tsx     # Podrška (Revolut, Buy Me a Coffee, kontakt)
├── hooks/
│   ├── useDraggable.ts        # Drag & drop logika
│   ├── usePdfCanvas.ts        # PDF rendering, barkod učitavanje, export
│   ├── usePdfParser.ts        # Orchestracija parsiranja (regex + AI fallback)
│   └── useResizable.ts        # Resize logika s touch podrškom
├── lib/
│   ├── download.ts            # Blob download helperi
│   ├── llmStorage.ts          # localStorage za API ključeve
│   ├── parseXmlInvoice.ts     # UBL 2.1 XML e-račun parser
│   ├── pdfWorker.ts           # PDF.js worker setup
│   └── utils.ts               # shadcn cn helper
├── modules/
│   ├── barcodeGenerator.ts    # PDF417 generiranje (bwip-js)
│   ├── geminiParser.ts        # Gemini API integracija
│   ├── groqParser.ts          # Groq API integracija
│   ├── hub3Formatter.ts       # HUB-3 string builder + sanitizacija
│   ├── pdfExporter.ts         # Ugrađivanje barkoda u PDF (pdf-lib)
│   └── pdfParser.ts           # Regex parser za hrvatska zaglavlja računa
└── types/
    └── hub3.ts                # Hub3Data, ParsedPdfFields, PURPOSE_CODES
```

---

## Poznata ograničenja

- PDF parsiranje je best-effort — layout računa varira između sustava, polja uvijek treba provjeriti
- Podržana je samo prva stranica PDF-a za pozicioniranje barkoda
- XML parser podrška: UBL 2.1 (CII format nije podržan)
- API ključevi se čuvaju u `localStorage` — koristiti ključeve skopane na domenu

---

## Licenca

MIT

---

*Za prilagođena rješenja: [mariozitko.github.io](https://mariozitko.github.io)*
