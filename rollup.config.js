import typescript from "@rollup/plugin-typescript"
import pkg from './package.json'
export default {
  input: "./src/index.ts",
  output: [
    // 打包类型 1： cjs -> commonjs
    // 2: esm
    {
      format: "cjs",
      file: pkg.main
    },
    {
      format: "es",
      file: pkg.module
    }
  ],
  // 配置 plugins   编译
  plugins: [
    typescript()
  ]
}