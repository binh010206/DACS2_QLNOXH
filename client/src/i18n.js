import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import 2 file từ điển vừa tạo
import vi from "./locales/vi.json";
import en from "./locales/en.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en }
    },
    lng: "vi", // Ngôn ngữ mặc định là Tiếng Việt
    fallbackLng: "vi",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;