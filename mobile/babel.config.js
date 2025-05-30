module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", 
       { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
     plugins: [
      // 👇 ใส่ plugin ตัวอื่นก่อนถ้ามี (เช่น nativewind)
      "react-native-reanimated/plugin", // 👈 ต้องอยู่ล่างสุดเสมอ
    ],

  };
};