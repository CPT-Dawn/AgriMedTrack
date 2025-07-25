module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Required for @react-navigation
      "@babel/plugin-transform-export-namespace-from",
      // Required for react-native-reanimated (must be last)
      "react-native-reanimated/plugin",
    ],
  };
};
