# Android Release Build (Local)

Build a signed `.aab` locally with Android Studio + JDK when you are ready to publish — no EAS/cloud build required.

> Skip this step during day-to-day development. The native `mobile/android/` project is already generated via `expo prebuild` for when you need it.

## Prerequisites

- JDK 17+
- Android Studio (with Android SDK)
- Node.js 20+

## 1. Generate native project

```bash
cd mobile
npm install
npx expo prebuild --platform android --clean
```

## 2. Create a release keystore

Store the keystore **outside** the repo (never commit it).

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore C:\path\to\tiny-flame-release.keystore -alias tiny-flame -keyalg RSA -keysize 2048 -validity 10000
```

## 3. Configure signing

Create or edit `mobile/android/gradle.properties` (do not commit secrets in shared repos):

```properties
MYAPP_UPLOAD_STORE_FILE=C:\\path\\to\\tiny-flame-release.keystore
MYAPP_UPLOAD_KEY_ALIAS=tiny-flame
MYAPP_UPLOAD_STORE_PASSWORD=your_store_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

Ensure `mobile/android/app/build.gradle` uses these variables in the `signingConfigs.release` block (added by Expo prebuild template).

## 4. Build the bundle

```bash
cd mobile/android
./gradlew bundleRelease
```

On Windows:

```powershell
.\gradlew.bat bundleRelease
```

Output: `mobile/android/app/build/outputs/bundle/release/app-release.aab`

Copy to the repo `release/` folder:

```powershell
Copy-Item mobile\android\app\build\outputs\bundle\release\app-release.aab ..\..\release\tiny-flame-1.0.0.aab
```

## 5. Android Studio alternative

1. Open `mobile/android` in Android Studio
2. **Build → Generate Signed App Bundle / APK**
3. Select **Android App Bundle**, choose your keystore
4. Build variant: **release**

## Version bumps

Update in `mobile/app.json`:

- `expo.version` — user-visible version (e.g. `1.0.1`)
- `expo.android.versionCode` — integer, must increase for each Play Store upload

Then re-run prebuild if native files need refresh:

```bash
npx expo prebuild --platform android
```
