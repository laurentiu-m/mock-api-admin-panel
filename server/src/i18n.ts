import path from "path";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware";

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    preload: ["en", "ro"],
    backend: {
      loadPath: path.resolve(__dirname, "locales/{{lng}}.json"),
    },
    detection: {
      order: ["header"],
    },
  });

export default i18next;
