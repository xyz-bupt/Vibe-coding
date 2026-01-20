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
      launchShowDuration: 0,
      launchAutoHide: false,
      launchFadeInDuration: 0,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidStyleXmlPath: "res/values/styles.xml",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "screen",
      useDialog: true,
      launchShowDuration: 1000,
      // 自动隐藏为false，让用户手动关闭
      launchAutoHide: true,
      fadeOutDuration: 1000
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: false,
    // 配置Android包名
    package: 'com.chesslayout.app',
    // 语言
    languageCode: 'zh',
    // 是否包含原生图标
    includeLegacyNativeDir: true,
    buildOptions: {
      // 配置签名
      keystorePath: 'android/app/keystore/keystore.jks',
      keystorePassword: 'chesslayout2024',
      keystoreAlias: 'chesslayout',
      keystoreAliasPassword: 'chesslayout2024',
      signingReady: true
    }
  }
};

export default config;
