# Android Auto Desktop Head Unit (DHU) Testing Guide

This guide explains how to test Android Auto features using the Desktop Head Unit emulator.

## Prerequisites

1. **Android Studio** installed with SDK Platform Tools
2. **Android device** with Android Auto app installed
3. **USB debugging** enabled on device

## Install DHU

### Option 1: SDK Manager

1. Open Android Studio
2. Go to **Tools > SDK Manager**
3. Select **SDK Tools** tab
4. Check **Android Auto Desktop Head Unit Emulator**
5. Click **Apply** and install

### Option 2: Manual Download

Download from Android Studio SDK location:
```
$ANDROID_HOME/extras/google/auto/
```

## Setup Device

### Enable Developer Mode in Android Auto

1. Open **Android Auto** app on your phone
2. Tap hamburger menu → **Settings**
3. Scroll to **Version** and tap it **10 times**
4. "Developer settings" will appear
5. Enable **Unknown sources**
6. Enable **Start head unit server**

### Start Head Unit Server

On your Android device:
1. Open Android Auto settings
2. Go to **Developer settings**
3. Tap **Start head unit server**

## Connect and Run DHU

### Connect Device via USB

```bash
adb devices
# Verify your device is listed
```

### Forward ADB Port

```bash
adb forward tcp:5277 tcp:5277
```

### Launch DHU

Navigate to DHU directory and run:

```bash
cd $ANDROID_HOME/extras/google/auto/

# Linux/macOS
./desktop-head-unit

# Windows
desktop-head-unit.exe
```

## DHU Commands

Once DHU is running, you can use these keyboard shortcuts:

| Key | Action |
|-----|--------|
| `m` | Microphone input |
| `n` | Trigger notification |
| `Esc` | Back button |
| `Enter` | Select/OK |
| Arrow keys | Navigation |

## Testing Car Tech Hub

### Verify App Appears

1. Launch DHU
2. Look for "Car Tech Hub" in the app launcher
3. Tap to open

### Test Screens

1. **Home Screen**: Verify weather snapshot and driving score appear
2. **Alerts**: Check traffic alerts list scrolls properly
3. **Trip**: Test start/stop trip button
4. **Maintenance**: Verify upcoming items display
5. **Diagnostics**: Check DTC summary grid

### Test Deep Links

From DHU, tap "Open on phone" buttons and verify:
- Phone app opens to correct screen
- Data syncs between phone and car display

## Debugging

### View Logs

```bash
adb logcat | grep -i "CarAppService\|CarTechHub"
```

### Common Issues

**App not appearing in DHU:**
- Verify AndroidManifest.xml has correct intent-filter
- Check that CarAppService is properly exported
- Rebuild the app

**Connection refused:**
```bash
# Kill existing adb server
adb kill-server
adb start-server
adb forward tcp:5277 tcp:5277
```

**Templates not rendering:**
- Check template constraints (max items, text length)
- Verify all required fields are populated
- Review Car App Library version compatibility

## Template Constraints

Android Auto has strict UI constraints:

| Template | Max Items | Notes |
|----------|-----------|-------|
| ListTemplate | 6 items | Use "See more" for additional |
| GridTemplate | 6 items | 2x3 or 3x2 layout |
| PaneTemplate | 4 actions | Max 2 rows of actions |
| MessageTemplate | 2 actions | Short text only |

## Wireless DHU (Android 11+)

For wireless testing:

1. Connect device to same WiFi as computer
2. Enable **Wireless debugging** on device
3. Pair using:
```bash
adb pair <IP>:<PORT>
adb connect <IP>:<PORT>
```

4. Forward port and run DHU as normal

## Resources

- [Android Auto Developer Guide](https://developer.android.com/training/cars)
- [Car App Library Reference](https://developer.android.com/reference/androidx/car/app/package-summary)
- [Testing Apps for Cars](https://developer.android.com/training/cars/testing)
- [DHU User Guide](https://developer.android.com/training/cars/testing/dhu)
