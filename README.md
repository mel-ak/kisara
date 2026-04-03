# Kisara - Smart Finance Tracker

![Kisara Banner](assets/icon.png)

**Kisara** is a modern, high-performance personal finance management application built for privacy, speed, and beautiful data visualization. Developed with Expo 54 and React Native 0.81, it provides an offline-first experience with robust local security.

---

## ⚡ Main Features

- 📈 **Interactive Analytics**: Visualize your spending habits with dynamic bar and pie charts.
- 💰 **Budget Control**: Set monthly limits and track your progress in real-time.
- 🔐 **Privacy Lock**: Secure your data with biometric (Fingerprint/FaceID) or PIN authentication.
- 📜 **Full History**: Easily manage and search through your entire transaction history.
- 📥 **Export & Import**: Export transactions to **CSV** or backup the entire database to **JSON**.
- 🏦 **Multi-Account Support**: Manage Cash, Bank, and Digital Wallet balances separately.
- 🏷️ **Custom Categories**: Personalize your tracking with custom income and expense categories.
- 🌓 **Modern Aesthetics**: A sleek UI built with React Native Paper (MD3) for a premium feel.
- 🧱 **Offline-First Storage**: Fast and reliable local storage using SQLite and Drizzle ORM.

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [Expo SDK 54](https://expo.dev/) (React Native 0.81) |
| **Database** | [Drizzle ORM](https://orm.drizzle.team/) + [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) |
| **Navigation** | [React Navigation](https://reactnavigation.org/) |
| **UI Components** | [React Native Paper](https://reactnativepaper.com/) |
| **Icons** | [Lucide React Native](https://lucide.dev/) |
| **Charts** | [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit) |
| **Biometrics** | [Expo Local Authentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/) |
| **File Handling** | [Expo Document Picker](https://docs.expo.dev/versions/latest/sdk/document-picker/) & [Sharing](https://docs.expo.dev/versions/latest/sdk/sharing/) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo Go (on your mobile device)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mel-ak/kisara.git
   cd kisara
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Launch the App:**
   - Scan the QR code with **Expo Go** (Android) or the **Camera app** (iOS).

---

## 🏗️ Project Structure

```text
├── assets/             # Images, fonts, and icons
├── src/                # Project Source Code
│   ├── db/             # Database schemas and Drizzle client
│   ├── screens/        # Main screen components (Analytics, Dashboard, etc.)
│   ├── store/          # Zustand store definitions (State Management)
│   ├── utils/          # Helper functions and hooks
├── App.tsx             # Root Application entry point
├── app.json            # Expo configuration
├── drizzle.config.ts    # Drizzle ORM configuration
└── tsconfig.json       # TypeScript configuration
```

---

## 🔒 Security

Kisara prioritizes your privacy. All financial data is stored locally on your device using **Expo-SQLite** and **Secure Store**. Your data never leaves your device unless you explicitly export it.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ for financial freedom.</p>
