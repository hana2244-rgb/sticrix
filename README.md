# 📋 Sticrix (Expo版)

Visualize tasks with sticky notes / 付箋でタスクを可視化するiOS/Androidアプリ

![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue)
![Expo](https://img.shields.io/badge/Expo-50.0-000020)
![React Native](https://img.shields.io/badge/React%20Native-0.73-61DAFB)

## 🎯 機能 / Features

- **3つの表示モード / 3 View Modes**
  - 📊 XY軸モード / XY Axis (Scatter)
  - 📋 カンバンモード / Kanban (Todo/Doing/Done)
  - ⚡ 4分割モード / Quadrant (Eisenhower Matrix)

- **多言語対応 / Multilingual**
  - 🇯🇵 日本語
  - 🇺🇸 English (default for non-Japanese)

- **タッチドラッグ＆ドロップ / Touch Drag & Drop**
- **6色の付箋カラー / 6 Sticky Note Colors**
- **Google AdMob広告対応 / AdMob Support**

---

## 🚀 クイックスタート

### 必要なもの

- [Node.js](https://nodejs.org/) (v18以上)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [EAS CLI](https://docs.expo.dev/eas/) (ビルド用)
- Expo Go アプリ（開発テスト用）

### 1. セットアップ

```bash
cd sticrix-expo

# 依存関係インストール
npm install

# 開発サーバー起動
npm start
```

### 2. 開発テスト（Expo Go）

```bash
npm start
```

QRコードをスマホのExpo Goアプリでスキャン

⚠️ **注意**: AdMobはExpo Goでは動作しません。
ネイティブビルドが必要です。

---

## 📱 ネイティブビルド（本番用）

### EAS Build を使用

```bash
# EAS CLIインストール
npm install -g eas-cli

# Expoにログイン
eas login

# iOSビルド
eas build --platform ios

# Androidビルド
eas build --platform android
```

### ローカルビルド

```bash
# iOS（Macのみ）
npx expo run:ios

# Android
npx expo run:android
```

---

## 📝 AdMob設定

### テストモード（開発中）

`App.js` 内で自動的にテストIDが使用されます（`__DEV__` 時）

### 本番リリース時

1. [Google AdMob](https://admob.google.com/) でアプリ登録

2. `app.json` を更新:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "GADApplicationIdentifier": "ca-app-pub-あなたのAppID"
      }
    },
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-あなたのAppID",
          "iosAppId": "ca-app-pub-あなたのAppID"
        }
      ]
    ]
  }
}
```

3. `App.js` 内の広告ユニットIDを更新:
```javascript
const adUnitId = __DEV__ ? TestIds.BANNER : Platform.select({
  ios: 'ca-app-pub-あなたのID/広告ユニット',
  android: 'ca-app-pub-あなたのID/広告ユニット',
});
```

---

## 🏪 ストア公開

### App Store (iOS)

```bash
# ビルド
eas build --platform ios --profile production

# 提出
eas submit --platform ios
```

`eas.json` の `submit.production.ios` を設定:
```json
{
  "appleId": "your-email@example.com",
  "ascAppId": "App Store Connect App ID"
}
```

### Google Play (Android)

```bash
# ビルド
eas build --platform android --profile production

# 提出
eas submit --platform android
```

`google-service-account.json` をプロジェクトルートに配置

---

## 📁 プロジェクト構造

```
sticrix-expo/
├── App.js              # メインコンポーネント（全機能含む）
├── app.json            # Expo設定
├── package.json        # 依存関係
├── babel.config.js     # Babel設定
├── eas.json            # EAS Build設定
├── assets/
│   ├── icon.png        # アプリアイコン (1024x1024)
│   ├── splash.png      # スプラッシュ画像
│   └── adaptive-icon.png  # Androidアダプティブアイコン
└── README.md
```

---

## 🎨 カスタマイズ

### アプリ名・ID変更

`app.json` を編集:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "android": {
      "package": "com.yourcompany.yourapp"
    }
  }
}
```

### アイコン変更

`assets/` フォルダ内の画像を置き換え:
- `icon.png` - 1024x1024 (App Store/Play Store)
- `splash.png` - スプラッシュ画面
- `adaptive-icon.png` - Android用

---

## 🔧 トラブルシューティング

### Metro bundler エラー

```bash
npx expo start --clear
```

### ネイティブモジュールエラー

```bash
# キャッシュクリア
rm -rf node_modules
npm install
npx expo start --clear
```

### AdMobが表示されない

- Expo Goでは動作しません
- `npx expo run:ios` または EAS Build を使用

---

## 📝 Capacitor版との違い

| 項目 | Expo版 | Capacitor版 |
|------|--------|------------|
| 言語 | React Native | Web (React) |
| ビルド | EAS Build | Xcode/Android Studio |
| OTA更新 | ✅ 対応 | ❌ 非対応 |
| パフォーマンス | ネイティブ | WebView |
| 開発速度 | 高速 | 中程度 |

---

## 📝 ライセンス

MIT License
