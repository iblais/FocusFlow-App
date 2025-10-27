# FocusFlow Mobile App - iOS & Android

## 🎉 Your App is Now Mobile-Ready!

FocusFlow has been converted into a native mobile app using **Capacitor**. You can now submit it to the **Apple App Store** and **Google Play Store**.

---

## 📱 How It Works

The mobile app loads your web app from Vercel (https://focusflow-henna-six.vercel.app) in a native wrapper. This gives you:

✅ **Native iOS and Android apps**
✅ **Access to device features** (haptics, keyboard, status bar, etc.)
✅ **App Store & Play Store submission ready**
✅ **No code duplication** - same codebase as web
✅ **Automatic updates** - changes to Vercel instantly reflect in app

---

## 🚀 Quick Start

### Prerequisites

**For iOS (Mac only):**
- macOS with Xcode 14+ installed
- Apple Developer Account ($99/year)
- CocoaPods: `sudo gem install cocoapods`

**For Android:**
- Android Studio installed
- Java JDK 17+
- Google Play Developer Account ($25 one-time)

---

## 📦 Build Commands

```bash
# Sync web assets to native projects
npm run mobile:sync

# Open iOS project in Xcode
npm run mobile:ios

# Open Android project in Android Studio
npm run mobile:android
```

---

## 🍎 iOS App Store Submission

### Step 1: Configure App in Xcode

```bash
npm run mobile:ios
```

This opens the iOS project in Xcode. Then:

1. **Select your Team:**
   - Click on "App" in the left sidebar
   - Under "Signing & Capabilities"
   - Select your Apple Developer Team

2. **Update Bundle Identifier:**
   - Change `com.focusflow.app` to your unique ID
   - Format: `com.yourcompany.focusflow`

3. **Update Display Name:**
   - Change "FocusFlow" to your preferred name

4. **Add App Icons:**
   - Go to `App/App/Assets.xcassets/AppIcon.appiconset`
   - Add icons (see Icon Requirements below)

5. **Add Launch Screen:**
   - Update `LaunchScreen.storyboard` with your branding

### Step 2: Build for Release

1. In Xcode, select **Product → Archive**
2. Once archived, click **Distribute App**
3. Choose **App Store Connect**
4. Follow the upload wizard

### Step 3: Submit to App Store

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app
3. Fill in metadata:
   - App name: FocusFlow
   - Subtitle: AI-Powered ADHD Task Management
   - Description: (see below)
   - Keywords: ADHD, productivity, focus, pomodoro, tasks
   - Category: Productivity
4. Add screenshots (see requirements below)
5. Submit for review

**Approval time:** Usually 1-3 days

---

## 🤖 Google Play Store Submission

### Step 1: Configure App in Android Studio

```bash
npm run mobile:android
```

This opens the Android project in Android Studio. Then:

1. **Update Package Name:**
   - Open `android/app/build.gradle`
   - Change `applicationId "com.focusflow.app"`
   - Use format: `com.yourcompany.focusflow`

2. **Update App Name:**
   - Open `android/app/src/main/res/values/strings.xml`
   - Change `<string name="app_name">FocusFlow</string>`

3. **Add App Icons:**
   - Replace icons in `android/app/src/main/res/mipmap-*` folders

4. **Update Colors:**
   - Edit `android/app/src/main/res/values/colors.xml`

### Step 2: Generate Signed APK/AAB

1. In Android Studio: **Build → Generate Signed Bundle / APK**
2. Choose **Android App Bundle (AAB)** (required for Play Store)
3. Create or select a keystore
4. **IMPORTANT:** Save your keystore credentials securely!
5. Choose **release** build variant
6. Build and save the AAB file

### Step 3: Submit to Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app
3. Fill in store listing:
   - App name: FocusFlow
   - Short description: AI task breakdown for ADHD minds
   - Full description: (see below)
   - Category: Productivity
4. Upload your AAB file under "Production"
5. Add screenshots (see requirements below)
6. Complete content rating questionnaire
7. Set pricing (Free)
8. Submit for review

**Approval time:** Usually 1-5 days

---

## 📸 App Store Assets Requirements

### iOS App Icons

Required sizes (all PNG, no transparency):
- 1024x1024 (App Store)
- 180x180 (iPhone)
- 167x167 (iPad Pro)
- 152x152 (iPad)
- 120x120 (iPhone)
- 87x87 (iPhone)
- 80x80 (iPad)
- 76x76 (iPad)
- 60x60 (iPhone)
- 58x58 (iPhone/iPad)
- 40x40 (iPhone/iPad)
- 29x29 (iPhone/iPad)
- 20x20 (iPhone/iPad)

### Android App Icons

Required sizes:
- 512x512 (Play Store icon)
- xxxhdpi: 192x192
- xxhdpi: 144x144
- xhdpi: 96x96
- hdpi: 72x72
- mdpi: 48x48

### Screenshots

**iOS:**
- 6.7" iPhone (1290 x 2796 px) - at least 3
- 5.5" iPhone (1242 x 2208 px) - at least 3
- 12.9" iPad Pro (2048 x 2732 px) - optional

**Android:**
- Phone: 1080 x 1920 px minimum - at least 2
- Tablet: 1200 x 1920 px - optional

---

## 📝 Store Descriptions

### Short Description (80 chars max)
```
AI-powered task breakdown and focus timer designed for ADHD minds
```

### Full Description

```
FocusFlow - The ADHD-Friendly Productivity App

Struggling with overwhelming tasks? FocusFlow uses AI to break down complex projects into manageable 5-15 minute micro-steps, perfect for ADHD brains.

KEY FEATURES:

🤖 AI Task Breakdown
• Turn daunting projects into bite-sized actions
• ADHD-optimized micro-steps with time estimates
• Energy-level matching for optimal productivity

⏱️ Pomodoro Focus Timer
• 25-minute focus sessions with automatic breaks
• Distraction tracking and rewards
• Visual progress with satisfying animations

🎮 Gamification That Works
• Earn XP for completed tasks and focus sessions
• Maintain streaks with visual shields
• Unlock achievements and celebrate wins

📊 Smart Analytics
• Track your focus patterns over time
• Understand your peak productivity hours
• Monitor executive function improvements

🎯 Built Specifically for ADHD:
• High contrast design for better focus
• Minimal cognitive load
• One primary action per screen
• Immediate visual feedback
• Progress tracking everywhere

Whether you have ADHD, struggle with executive function, or just want better productivity tools, FocusFlow helps you:
✓ Break down overwhelming tasks
✓ Stay focused longer
✓ Build sustainable habits
✓ Feel accomplished every day

Download FocusFlow and transform your productivity today!
```

---

## 🔧 Configuration Files

### Update Bundle ID (Important!)

**iOS:** Edit `ios/App/App.xcodeproj/project.pbxproj`
**Android:** Edit `android/app/build.gradle`

Change `com.focusflow.app` to your unique identifier: `com.yourcompany.appname`

### Update App Name

**iOS:** Edit `ios/App/App/Info.plist`
```xml
<key>CFBundleDisplayName</key>
<string>Your App Name</string>
```

**Android:** Edit `android/app/src/main/res/values/strings.xml`
```xml
<string name="app_name">Your App Name</string>
```

---

## 🐛 Troubleshooting

### iOS Build Fails

```bash
# Clean and reinstall pods
cd ios/App
pod deintegrate
pod install
cd ../..
```

### Android Build Fails

```bash
# Clean gradle cache
cd android
./gradlew clean
cd ..
```

### App Doesn't Load Content

Check that:
1. Vercel deployment is successful
2. URL in `capacitor.config.ts` is correct
3. Internet connection is available

---

## 🔄 Updating the App

When you push changes to Vercel:
1. ✅ Web app updates automatically
2. ✅ Mobile app gets updates on next launch (no app store submission needed!)

Only submit new versions to app stores when you:
- Change app icons or branding
- Add new native features
- Update Capacitor plugins
- Change bundle ID or app name

---

## 📱 Testing on Real Devices

### iOS

1. Connect iPhone via USB
2. Open Xcode: `npm run mobile:ios`
3. Select your device at the top
4. Click the Play button

### Android

1. Enable Developer Mode on Android device
2. Connect via USB
3. Open Android Studio: `npm run mobile:android`
4. Click Run

---

## 🔐 Important Security Notes

1. **Never commit your keystores** to Git
2. **Save keystore credentials** securely (you can't recover them!)
3. **Keep App Store credentials** private
4. **Environment variables** on Vercel are secure

---

## 📚 Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Material Design](https://material.io/design)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)

---

## 🎯 Next Steps

1. ✅ Install Xcode (Mac) or Android Studio
2. ✅ Run `npm run mobile:ios` or `npm run mobile:android`
3. ✅ Test on a real device
4. ✅ Create app icons and screenshots
5. ✅ Build for release
6. ✅ Submit to app stores!

---

**Your mobile app is ready!** 🚀

The native projects are in `/ios` and `/android` folders. Open them with `npm run mobile:ios` or `npm run mobile:android` to start building for the app stores!
