const nextPlugin = require("eslint-config-next");

module.exports = [
  {
    ignores: ["dist/**", ".next/**", "node_modules/**", "out/**"],
  },
  ...nextPlugin.map(config => {
    // Downgrade some to warnings
    if (config.rules) {
      const newRules = { ...config.rules };
      // Allow setState in effects (common pattern)
      if (newRules["react-hooks/set-state-in-effect"]) {
        newRules["react-hooks/set-state-in-effect"] = "warn";
      }
      // Allow variable access before declaration in effects (common async pattern)
      if (newRules["react-hooks/immutability"]) {
        newRules["react-hooks/immutability"] = "warn";
      }
      // Allow purity violations for common patterns
      if (newRules["react-hooks/purity"]) {
        newRules["react-hooks/purity"] = "warn";
      }
      return { ...config, rules: newRules };
    }
    return config;
  }),
];