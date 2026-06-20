<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# 🔥 Resume Roaster & Optimizer (v1.4 Enterprise)

A premium, full-stack resume evaluation and ATS optimization platform powered by a robust multi-tier Gemini AI orchestration pipeline. It scans, critiques, scores, and refactors resumes to convert vulnerable CVs into high-yield, ATS-secure professional profiles.

---

## 🌟 Core Strategic Features

*   **⚡ Multi-Tier AI Analysis & Fallback Gateway**: Operates with automated exponential backoff and model routing (`gemini-3.5-flash` ➜ `gemini-flash-latest` ➜ `gemini-3.1-flash-lite`) to bypass peak traffic spikes and ensure robust server availability.
*   **📈 ATS Scorecard & Compliance suite**: Computes precision keyword alignment scores, parsing safety parameters, and displays clear visual indicators of semantic disqualification risks.
*   **🎭 Multi-Persona Roaster & Critique Engine**: Delivers rich recruiter narrative feedback styled along selectable roasting severity criteria and professional industry types.
*   **⚖️ Strategic Bullet Refactoring**: Displays custom interactive "Before & After" comparative tables detailing the original weak formulation, the proposed professional KPI metric-oriented rewrite, and the reasoning behind each correction.
*   **🗂️ Red-Zone Buzzwords & Metric Detectors**: Automatically flags high-risk cliché fillers (e.g. *team-player, synergy*) and highlights missing quantitative indicators and impact-driven KPIs.
*   **🌓 Unified Global Theme System**: Incorporates an eye-safe ambient dark mode toggle, fully synchronized and persisted using state restoration headers.
*   **📄 Executive PDF Report Exporter**: Custom-engineered print-safe PDF compiler that handles seamless page wrapping, column heights synchronization, auto-alignments, and severity stamping.

---

## 🏗️ Technical Architecture

This repository uses a full-stack architecture pairing a fast-serving **Express** backend proxy with a responsive modern **React** Single Page Application through **Vite**.

```text
├── server.ts                  # Full-stack backend server & Gemini gateway proxy
├── src/
│   ├── App.tsx                # Main Application Shell, Forms, Dashboard layout
│   ├── types.ts               # Shared strict TypeScript interface definitions
│   ├── index.css              # Custom variables, transitions & theme style sets
│   ├── utils/
│   │   └── pdf.ts             # Precision jsPDF layout & automatic page flow code
```

*   **Backend Server**: Exposes lazy-initialized `/api/evaluate` endpoints, routing request contexts safely and hiding secure API keys from the client-side browser space.
*   **Frontend Client**: Custom layout engineered with **Tailwind CSS** guidelines. Employs "Inter" sans-serif for comfortable data legibility paired with "JetBrains Mono" for diagnostics elements.

---

## 🚀 Quick Start Guide

### 1. Configure Local Environment
Ensure you define your Gemini server variables before executing boot cycles. Create a `.env` file in your root workspace:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Install Project Dependencies
Use NPM packages installer:
```bash
npm install
```

### 3. Run Development Server
Boot up the integrated Express + Vite live compilation pipeline:
```bash
npm run dev
```
The application will boot up and serve traffic dynamically on port `3000`.

### 4. Build for Production
To produce fully optimized and bundled compilation products:
```bash
npm run build
```
This builds static artifacts on `dist/` and compiles the backend server cleanly into `dist/server.cjs`.

### 5. Launch Standalone Build
```bash
npm run start
```

---

## 📄 Custom PDF Export Engineering

The PDF layout engine (`src/utils/pdf.ts`) is designed dynamically to avoid layout shifting or text truncations:
1.  **Strict Overflow Tracking**: Continually computes remaining canvas space `currentY + height` against page parameters before printing a block, injecting programmatic page inserts (`addNewPage()`) when boundaries are breached.
2.  **Symmetrical Dual Columns**: Synchronizes heights between *High-risk Cliché Buzzwords* and *Critical Missing KPIs* boxes to avoid overlapping artifacts.
3.  **Automatic String Wrapping**: Runs multi-line texts through `doc.splitTextToSize` with dynamic indentations, eliminating text overflow beyond borders.

---

## 🤝 Contributing

We welcome contributions from the community! To ensure a smooth collaborative workflow, please adhere to the following guidelines:
1. Fork the repository and create your feature branch (`git checkout -b feature/AdvancedRoaster`).
2. Commit your changes with descriptive messages (`git commit -m 'Add AdvancedRoaster module'`).
3. Push to the branch (`git push origin feature/AdvancedRoaster`).
4. Open a Pull Request targeting the `main` branch.

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📧 Support & Contact

For enterprise support, bug reports, or feature requests, please open an issue on the repository tracker.

---

<div align="center">
  <b>Built with ❤️ using Gemini AI & React</b>
</div>
