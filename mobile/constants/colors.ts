const primary = "#2563eb";
const secondary = "#0ea5e9";
const success = "#10b981";
const warning = "#f59e0b";
const danger = "#ef4444";
const gray = {
  50: "#f9fafb",
  100: "#f3f4f6",
  200: "#e5e7eb",
  300: "#d1d5db",
  400: "#9ca3af",
  500: "#6b7280",
  600: "#4b5563",
  700: "#374151",
  800: "#1f2937",
  900: "#111827",
};

export const palette = {
  primary,
  secondary,
  success,
  warning,
  danger,
  gray,
};

export const lightTheme = {
  ...palette,
  background: "#ffffff",
  card: "#ffffff",
  text: {
    primary: gray[900],
    secondary: gray[600],
    light: gray[400],
  },
  border: gray[200],
  shadow: "rgba(0, 0, 0, 0.1)",
};

export const darkTheme = {
  ...palette,
  background: "#111827",
  card: "#1f2937",
  text: {
    primary: "#ffffff",
    secondary: gray[400],
    light: gray[500],
  },
  border: gray[700],
  shadow: "rgba(0, 0, 0, 0.3)",
};

export default lightTheme;

