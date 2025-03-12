module.exports = {
  i18n: {
    defaultLocale: "he",
    locales: ["he", "en"],
  },
  localePath: typeof window === "undefined" ? require("path").resolve("./public/locales") : "/locales",
}

