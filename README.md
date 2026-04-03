<div align="center">
  <img src="./assets/icon.png" alt="Kisara Logo" width="120" height="120" />
  
  # Kisara - Personal Finance
  
  **Your localized, privacy-first personal finance companion.**

  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
  [![Zustand](https://img.shields.io/badge/Zustand-4A4A55?style=for-the-badge&logoColor=white)](https://github.com/pmndrs/zustand)
</div>

<br />

Kisara is a modern, offline-first React Native application designed to help users effectively manage their personal finances, specifically optimized for the Ethiopian market. It provides a comprehensive suite of tools for budgeting, tracking expenses, analyzing financial habits, and keeping your data secure on your own device.

## ✨ Features

- 💸 **Expense & Income Tracking:** Easily categorize and record daily transactions.
- 📊 **Advanced Analytics:** Visualize your spending patterns with beautiful charts and track progress towards savings goals.
- 🎯 **Budget Management:** Set budget limits and get visual indicators of your monthly spending math correctly calculated.
- 🛡️ **Privacy & Security:** Features balance masking and biometric/PIN authentication using Expo Local Authentication to keep your financial data visually and securely hidden.
- 💾 **100% Local Data Ownership:** Powered by a local SQLite database (via Drizzle ORM). Your data never leaves your device unless you choose to export it.
- 🔄 **Backup & Restore:** Robust JSON export and import system for data portability and backup, handling relationships effortlessly.
- 🎨 **Modern UI:** Built with React Native Paper, Lucide icons, and Reanimated for a smooth user experience.

## 🛠️ Technology Stack

- **Framework:** [React Native](https://reactnative.dev/) (with [Expo](https://expo.dev/))
- **Database:** [SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **State Management:** [Zustand](https://zustand-demo.pmndrs.docs.vercel.app/)
- **Navigation:** [React Navigation](https://reactnavigation.org/) (Bottom Tabs & Native Stack)
- **UI Components:** [React Native Paper](https://callstack.github.io/react-native-paper/)
- **Charts:** [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)
- **Language:** [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed to run the project:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/workflow/expo-cli/)
- Expo Go app on your physical device, or an iOS Simulator / Android Emulator.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/kisara.git
   cd kisara
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Generate/Push Database Schema (Drizzle):**
   *(Note: Kisara handles local SQLite migrations, but you can utilize drizzle-kit if making edits to the schema.)*
   ```bash
   npm run drizzle-kit generate
   ```

4. **Start the development server:**
   ```bash
   npm start
   # or
   npx expo start
   ```

5. **Open the app:**
   - Scan the QR code shown in your terminal using the Expo Go app.
   - Alternatively, press `a` to open in Android Emulator, or `i` to open in iOS Simulator (macOS only).

## 📂 Project Structure

```text
kisara/
├── assets/                 # App icons, splash screens, and images
├── src/
│   ├── db/                 # Drizzle ORM schema (.ts) and client setup
│   ├── screens/            # Application screens (BudgetScreen, Analytics, Settings, etc.)
│   ├── store/              # Zustand global state (e.g., useSecurityStore)
│   └── ...                 # Additional components, context, and utilities
├── App.tsx                 # Main application entry point
├── app.json                # Expo configuration file
├── package.json            # Project dependencies and scripts
├── drizzle.config.ts       # Drizzle Kit configuration
└── README.md
```

## 🔐 Security & Privacy

Kisara takes privacy seriously. Key security features are managed by `useSecurityStore.ts` and the `SettingsScreen.tsx`:
- Local authentication integration ensures only you can open the app.
- Balance masking toggles prevent "shoulder surfing" when checking funds in public.

## 🤝 Contributing

Contributions are always welcome! Since this is a public repository, feel free to submit Pull Requests or open Issues if you encounter bugs or want to suggest new features.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open-source. *(Please add your custom license details here, e.g., MIT, GPL.)*
