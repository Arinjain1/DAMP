module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxRuntime: "automatic" }],
      "nativewind/babel",
    ],
    plugins: [
      "react-native-reanimated/plugin", // Yeh hamesha array ke andar last mein hona chahiye
    ],
  };
};