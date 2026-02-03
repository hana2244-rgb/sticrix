# Expo SDK アップグレードガイド（SDK 49 → SDK 51）

## ⚠️ 重要
Appleの要件により、2025年4月24日以降は**Xcode 16以降とiOS 18 SDK**でビルドされたアプリのみがApp Store Connectに提出可能です。

Expo SDK 49はこの要件に対応していないため、**SDK 51または52へのアップグレードが必要**です。

## 📋 アップグレード手順

### 1. 現在の状態を確認
```bash
cd C:\sticrix-expo
npx expo doctor
```

### 2. Expo SDKをアップグレード
```bash
# SDK 51にアップグレード
npx expo install expo@^51.0.0

# または SDK 52にアップグレード（最新）
npx expo install expo@^52.0.0
```

### 3. 依存関係を修正
```bash
npx expo install --fix
```

### 4. プロジェクトの状態を確認
```bash
npx expo doctor
```

### 5. ネイティブプロジェクトの更新
Continuous Native Generationを使用している場合：
```bash
# android と ios ディレクトリを削除（存在する場合）
# 次回ビルド時に自動生成されます
```

### 6. 再ビルド
```bash
eas build --platform ios --profile production
```

### 7. 提出
```bash
npx eas submit -p ios
```

## 🔍 既知の問題（SDK 51→52）

アップグレード時に以下の問題が発生する可能性があります：

1. **android/gradle.properties** の変更が必要
   - Java 17互換性
   - MaxPermSizeの削除

2. **app.json** への追加が必要
   - `expo-splash-screen` の設定（Android用）

3. **Breaking Changes**
   - チャンジェログを確認してください

## 📝 注意事項

- SDK 49から51/52へのアップグレードは大きな変更を含む可能性があります
- 段階的にアップグレードすることを推奨（49→50→51）
- アップグレード前にバックアップを取ってください
- 依存関係の競合が発生する可能性があります

## 🔗 参考リンク

- [Expo SDK アップグレードガイド](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough)
- [Native project upgrade helper](https://docs.expo.dev/bare/upgrade)
