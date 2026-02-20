# Expo Go で実機テスト

## 前提
- PC とスマホを **同じ Wi‑Fi** に接続（または後述のトンネルモードを使用）
- プロジェクトは **SDK 52**（Expo Go 対応）

---

## 1. スマホに Expo Go をインストール

| 端末 | インストール先 |
|------|----------------|
| **iPhone / iPad** | [App Store - Expo Go](https://apps.apple.com/app/expo-go/id982107779) |
| **Android** | [Google Play - Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) |

---

## 2. PC で開発サーバーを起動

```bash
cd C:\sticrix-expo
npx expo start
```

起動するとターミナルに **QR コード** が表示されます。

---

## 3. 実機で Expo Go を開いて接続

### iPhone / iPad
1. **Expo Go** アプリを開く
2. **「Scan QR code」** をタップ
3. PC のターミナルに表示されている **QR コード** をスキャン  
   （または iPhone の **カメラ** で読み取り → 表示された通知から Expo Go を開く）

### Android
1. **Expo Go** アプリを開く
2. **「Scan QR code」** をタップ
3. PC のターミナルに表示されている **QR コード** をスキャン

---

## 4. 同じ Wi‑Fi で接続できない場合（トンネルモード）

社内 Wi‑Fi やファイアウォールで接続できないときは、トンネルモードを使います。

```bash
cd C:\sticrix-expo
npx expo start --tunnel
```

初回は `@expo/ngrok` のインストールを求められたら **Y** で進めてください。  
表示された QR コードを、実機の Expo Go でスキャンすると接続できます。

---

## 5. よくあるトラブル

| 現象 | 対処 |
|------|------|
| 「Unable to connect」 | PC とスマホが同じ Wi‑Fi か確認。ダメなら `npx expo start --tunnel` |
| QR コードが表示されない | ターミナルで **s** キー → 「Switch to development build」などで表示を切り替え |
| 白画面のまま | `npx expo start -c` でキャッシュをクリアして再起動 |
| 実機で反映されない | 実機の Expo Go でプロジェクトを閉じて、再度 QR コードをスキャン |

---

## 6. 開発サーバー起動時のメニュー

`npx expo start` 実行後、ターミナルで次のキーが使えます。

- **s** … 開発メニュー（QR 表示切替など）
- **r** … リロード
- **c** … キャッシュをクリアして再起動
- **j** … Chrome DevTools を開く（デバッグ用）
