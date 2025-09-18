import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark";

interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  text: string;
  textSecondary: string;
  border: string;
  card: string;
  header: string;
  success: string;
  error: string;
  warning: string;
}

const lightTheme: ThemeColors = {
  background: "#F4FDF4",
  surface: "#FFFFFF",
  primary: "#228B22",
  text: "#000000",
  textSecondary: "#666666",
  border: "#E0E0E0",
  card: "#FFFFFF",
  header: "#228B22",
  success: "#28A745",
  error: "#FF4C4C",
  warning: "#FFC107",
};

const darkTheme: ThemeColors = {
  background: "#121212",
  surface: "#1E1E1E",
  primary: "#4CAF50",
  text: "#FFFFFF",
  textSecondary: "#AAAAAA",
  border: "#333333",
  card: "#2D2D2D",
  header: "#1B5E20",
  success: "#4CAF50",
  error: "#F44336",
  warning: "#FF9800",
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.log("Erro ao carregar tema:", error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem("theme", newTheme);
    } catch (error) {
      console.log("Erro ao salvar tema:", error);
    }
  };

  const colors = theme === "light" ? lightTheme : darkTheme;
  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
