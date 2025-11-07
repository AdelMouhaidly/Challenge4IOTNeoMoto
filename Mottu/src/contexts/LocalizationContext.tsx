import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { I18n } from "i18n-js";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ptBR from "../locales/pt-BR";
import es from "../locales/es";

type Language = "pt-BR" | "es";

interface LocalizationContextType {
  t: (key: string, options?: any) => string;
  locale: Language;
  setLocale: (locale: Language) => void;
}

const i18n = new I18n({
  "pt-BR": ptBR,
  es: es,
});
i18n.enableFallback = true;
i18n.defaultLocale = "pt-BR";

const LocalizationContext = createContext<LocalizationContextType | undefined>(
  undefined
);

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error(
      "useLocalization must be used within a LocalizationProvider"
    );
  }
  return context;
};

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [locale, setLocaleState] = useState<Language>("pt-BR");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadLocale();
  }, []);

  const loadLocale = async () => {
    try {
      const savedLocale = await AsyncStorage.getItem("locale");
      if (savedLocale === "pt-BR" || savedLocale === "es") {
        setLocaleState(savedLocale);
        i18n.locale = savedLocale;
      } else {
        const locales = Localization.getLocales();
        const deviceLocale =
          locales && locales.length > 0
            ? locales[0].languageTag || locales[0].languageCode
            : "pt-BR";
        const defaultLocale = deviceLocale.startsWith("es") ? "es" : "pt-BR";
        setLocaleState(defaultLocale);
        i18n.locale = defaultLocale;
      }
    } catch (error) {
      console.log("Erro ao carregar idioma:", error);
    } finally {
      setIsReady(true);
    }
  };

  const setLocale = async (newLocale: Language) => {
    i18n.locale = newLocale;
    setLocaleState(newLocale);
    try {
      await AsyncStorage.setItem("locale", newLocale);
    } catch (error) {
      console.log("Erro ao salvar idioma:", error);
    }
  };

  const t = useMemo(
    () => (key: string, options?: any) => {
      return i18n.t(key, options);
    },
    [locale]
  );

  if (!isReady) {
    return null;
  }

  return (
    <LocalizationContext.Provider value={{ t, locale, setLocale }}>
      {children}
    </LocalizationContext.Provider>
  );
};
