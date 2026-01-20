@echo off
:: 象棋布局教学 Android 构建脚本 (Windows)
:: 使用方法: build-android.bat [debug|release]

setlocal enabledelayedexpansion

:: 项目路径
set PROJECT_DIR=%~dp0
set ANDROID_DIR=%PROJECT_DIR%android
set GRADLEW=%ANDROID_DIR%\gradlew.bat

:: 默认构建类型
set BUILD_TYPE=debug
if not "%1"=="" set BUILD_TYPE=%1

echo ========================================
echo 象棋布局教学 Android 构建脚本
echo ========================================
echo.

:: 检查 Java 环境
echo 检查 Java 环境...
java -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 错误: Java 未安装或不在 PATH 中
    echo 请安装 Java 17+
    pause
    exit /b 1
)

:: 设置 Java 环境 (根据实际安装路径调整)
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%

:: 检查 Android 项目
echo 检查 Android 项目...
if not exist "%ANDROID_DIR%" (
    echo 错误: Android 项目不存在，请先运行:
    echo   npx cap init android
    echo   npx cap sync android
    pause
    exit /b 1
)

:: 检查 gradlew
if not exist "%GRADLEW%" (
    echo 错误: gradlew.bat 不存在
    pause
    exit /b 1
)

:: 检查 Web 资源
echo 检查 Web 资源...
if not exist "%PROJECT_DIR%dist" (
    echo 构建 Web 应用...
    cd /d "%PROJECT_DIR%"
    npm run build
)

:: 同步 Web 资源
echo 同步 Web 资源到 Android...
cd /d "%PROJECT_DIR%"
if not exist "node_modules\@capacitor\cli\bin\capacitor.js" (
    echo 错误: Capacitor CLI 未安装
    pause
    exit /b 1
)
node node_modules\@capacitor\cli\bin\capacitor.js sync android
if %ERRORLEVEL% NEQ 0 (
    echo 错误: Web 资源同步失败
    pause
    exit /b 1
)

:: 执行构建
echo 构建 Android 应用 (%BUILD_TYPE%)...
cd /d "%ANDROID_DIR%"

if "%BUILD_TYPE%"=="release" (
    echo Release 构建需要签名配置
    echo 请确保已配置签名 keystore 或使用:
    echo   gradlew.bat assembleRelease --signing-key-path \path\to\keystore.jks

    :: 尝试构建
    gradlew.bat assembleRelease
    if %ERRORLEVEL% NEQ 0 (
        echo 构建失败！
        pause
        exit /b 1
    )
) else (
    :: Debug 构建
    gradlew.bat assembleDebug
    if %ERRORLEVEL% NEQ 0 (
        echo 构建失败！
        pause
        exit /b 1
    )

    :: 尝试安装到连接的设备
    echo 尝试安装到连接的设备...
    gradlew.bat installDebug
    if %ERRORLEVEL% EQU 0 (
        echo 应用已安装到设备！
    ) else (
        echo 没有连接的设备或安装失败
        echo 手动安装命令:
        echo   adb install app\build\outputs\apk\debug\app-debug.apk
    )
)

echo.
echo ========================================
echo 构建完成！
echo ========================================
echo APK 路径: %ANDROID_DIR%\app\build\outputs\apk\debug\app-debug.apk

endlocal