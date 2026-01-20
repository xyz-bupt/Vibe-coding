import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chesslayout.app',
  appName: '象棋布局教学',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // 开发服务器配置
    // androidStudioPath: '/Applications/Android Studio.app',
    // cleartext: true,
    // localhost: '192.168.1.100'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeInDuration: 200,
      fadeOutDuration: 300,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidStyleXmlPath: "res/values/styles.xml",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "screen",
      useDialog: true
    }
  },
  android: {
    allowMixedContent: false, // 禁止混合内容，提高安全性
    captureInput: false,
    // 配置Android包名
    package: 'com.chesslayout.app',
    // 语言
    languageCode: 'zh',
    // 是否包含原生图标
    includeLegacyNativeDir: true,
    // 签名配置从环境变量读取，不在代码中硬编码
    // 构建时通过命令行参数传入: --keystore-path --keystore-password 等
    buildOptions: {
      // 使用环境变量，避免硬编码敏感信息
      // 示例: process.env.KEYSTORE_PASSWORD
      // 在 CI/CD 或本地构建时通过 Gradle properties 文件配置
    }
  }
};

export default config;
