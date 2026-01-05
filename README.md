# 🏭 Kovai MSME-Optima

> **AI-Powered Industrial Intelligence for Coimbatore's MSME Sector.**

---

## 📍 The Challenge: Coimbatore's Survival Crisis

Coimbatore is home to over 30,000 MSMEs (Textiles, Pumps, Foundries). As of **January 2026**, these units face a critical survival threat due to:

-   **Energy Inflation:** Rising TANGEDCO industrial tariffs and heavy peak-hour (6-10 AM/PM) penalties.
-   **Reactive Maintenance:** Unexpected machine failure leading to massive production downtime and loss of local livelihoods.
-   **The Gap:** Small-scale owners lack the data or funds for expensive IoT systems.

## 🚀 The Solution: Kovai MSME-Optima

**Kovai MSME-Optima** is an "Agentic AI Co-pilot" that turns a smartphone into an industrial diagnostic tool. It moves factories from reactive to predictive operations.

### ✨ Key Features

1.  **AI Bill Scanner (Gemini 2.0 Flash):**
    -   Upload any TANGEDCO bill.
    -   Extracts peak consumption data and applies **2026 TNERC Tariff Logic**.
    -   Generates a "Power Playbook" to shift loads and save up to 20% on monthly costs.
2.  **Acoustic Diagnostics (Vertex AI):**
    -   Record 10s of machine sound via the app.
    -   Uses spectral analysis to detect bearing friction or motor faults before a breakdown occurs.
3.  **Bilingual SaaS Dashboard:**
    -   Premium, accessible UI in **Tamil (தமிழ்)** and **English**.
    -   Real-time monthly savings charts and human-readable PDF reports.

## 🛠 Tech Stack (Google Ecosystem)

Built with the latest **2026 Google Developer Tools**:

-   **Gemini 2.0 Flash:** Multimodal reasoning for bill image and audio analysis. Manage API keys at [Google AI Studio](aistudio.google.com).
-   **Vertex AI:** Time-series forecasting and acoustic anomaly detection. Explore the platform at [Google Cloud Vertex AI](cloud.google.com).
-   **Firebase Genkit:** Orchestrating AI workflows and LLM prompts. View the [Firebase Genkit Documentation](firebase.google.com).
-   **Cloud Firestore:** Real-time persistence for factory profiles and energy logs.
-   **Firebase Auth:** Secure production-grade SME owner authentication.
-   **React (Vite) + Tailwind CSS v4:** High-performance, theme-able industrial UI.

## 📈 Impact Metrics

-   **15-20% Savings:** Average reduction in monthly electricity penalties.
-   **25% Less Downtime:** Early fault detection prevents critical seizures.
-   **SDG Alignment:** Contributing to Goal 9 (Industry & Innovation) and Goal 11 (Sustainable Cities).

## 💻 Getting Started

### Prerequisites

-   Node.js (v20+)
-   Firebase CLI: `npm install -g firebase-tools`
-   Google AI Studio API Key: Available at [Google AI Studio](aistudio.google.com)

### Installation

1.  Clone the repo:
    ```bash
    git clone github.com
    cd kovai-msme-optima
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    Create a `.env.local` file:
    ```env
    VITE_GEMINI_API_KEY=your_key_here
    VITE_FIREBASE_CONFIG=your_config_json_here
    ```
4.  Run locally:
    ```bash
    npm run dev
    ```

## 🎥 Video Demo

[Watch the Presentation on YouTube](https://www.youtube.com/watch?v=RZDPokqMcJY)

---

## 🌐 MVP Live Link
[**Launch Kovai MSME-Optima MVP**](https://tech-sprint-mvp.web.app/)

---

## 🤝 The Team

Developed with ❤️ in Coimbatore for the **GDG Tech Sprint Hackathon 2026**.

-   **Vengadesh** - *Team Lead / Product Developer*
-   **Pratibha** - *Research*
-   **Shaliha Farzana** - *UI/UX*

---

*Disclaimer: This project is a prototype built for the GDG Open Innovation Challenge. All tariff calculations are based on Tamil Nadu Electricity Board (TANGEDCO) January 2026 public data.*
