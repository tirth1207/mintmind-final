import 'dotenv/config';

export default {
  expo: {
    name: "MintMind Budget Planner",
    slug: "mintmind-budget-planner",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "mintmind",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },

    extra: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      eas: {
        projectId: "3d0c52c0-5a7d-4bb4-a169-0fb3a8fd3158"  // ← Your EAS project ID
      }
    },

    ios: {
      supportsTablet: false,
      bundleIdentifier: "app.rork.mintmind-budget-planner"
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "app.rork.mintmind_budget_planner"
    },

    web: {
      favicon: "./assets/images/favicon.png"
    },

    plugins: [
      ["expo-router", { origin: "https://rork.com/" }],
      "expo-font",
      "expo-web-browser"
    ],

    experiments: {
      typedRoutes: true
    }
  }
};
