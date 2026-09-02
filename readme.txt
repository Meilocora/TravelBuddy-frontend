// START \\
npx expo start -c

// DEV Build - zum testen \\
eas build --profile development -p android

// PREVIEW Build - zum benutzen \\
eas build --profile preview -p android

// DEBUG \\
1. CMD öffnen

2. 
cd "C:\Users\eric-\AppData\Local\Android\Sdk\platform-tools"

3. 
adb devices

4.a) Für Crash
adb logcat | findstr /i "fatal androidruntime crash"

4.b) Für Console.logs
adb logcat *:S ReactNative:V ReactNativeJS:V

5. App öffnen