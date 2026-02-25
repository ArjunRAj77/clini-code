# 🏥 Clinicode

**Instant ICD-10 Search & Intelligent Medical Report Analysis**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Vite](https://img.shields.io/badge/Vite-6.0-purple)

Clinicode is a privacy-first, high-performance web application designed to streamline medical coding workflows. It features a lightning-fast fuzzy search for ICD-10 codes and an AI-simulated medical report analyzer that detects clinical terms and suggests codes in real-time.

---

## ✨ Features

-   **🔍 Smart ICD-10 Search**: Instant, fuzzy-logic search across the entire 2023 ICD-10 database. Handles typos and synonyms with ease.
-   **🧠 AI Report Analyzer**: Paste or upload medical reports (`.txt`) to automatically detect conditions and procedures.
-   **⚡ Real-Time Processing**: Powered by Web Workers for non-blocking, high-performance text analysis directly in the browser.
-   **🛡️ Privacy First**: **Zero data retention.** All processing happens client-side. No patient data is ever sent to a server.
-   **📱 Responsive Design**: A clinical-grade UI built with Tailwind CSS and shadcn/ui, optimized for all devices.

## 🛠️ Tech Stack

-   **Frontend**: React 19, TypeScript, Tailwind CSS
-   **Build Tool**: Vite
-   **Search Engine**: Fuse.js (Client-side fuzzy search)
-   **Performance**: Web Workers for background processing
-   **UI Components**: Lucide React, shadcn/ui patterns
-   **Data Handling**: PapaParse for CSV processing

## 🚀 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/clinicode.git
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

## 📂 Project Structure

```
src/
├── components/     # Reusable UI components (SearchInterface, UI kit)
├── hooks/          # Custom hooks (useDebounce, useICD10Data)
├── lib/            # Utilities and data fetching logic
├── pages/          # Main application pages (Landing, Analyzer, Search)
├── workers/        # Web Workers for heavy data processing
└── App.tsx         # Main application entry
public/
└── icd10-2023.csv  # ICD-10 Data Source
```

## 📝 Data Source

This application uses the **2023 ICD-10-CM** code set. The data is loaded dynamically from a CSV file in the public directory, ensuring the app stays lightweight until the data is needed.

## 👨‍💻 Credits

**Vibe Coded by Arjun** ✨

---

*Disclaimer: This tool is for educational and coding assistance purposes only. It is not a substitute for professional clinical diagnosis or official coding guidelines.*
