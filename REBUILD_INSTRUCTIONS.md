# SDK 51 アップグレード完了 - 再ビルド手順

## ✅ 完了した作業
- Expo SDK 49 → SDK 51 へのアップグレード完了
- 依存関係の修正完了
- React Native 0.72.10 → 0.74.5 へのアップグレード完了
- eas.jsonに最新ビルドイメージの設定を追加

## 🚀 次のステップ：再ビルド

### 1. EAS Buildの実行
```bash
cd C:\sticrix-expo
eas build --platform ios --profile production
```

このビルドは：
- ✅ Xcode 16以降を使用（最新イメージ）
- ✅ iOS 18 SDKでビルド
- ✅ Appleの要件を満たします

### 2. ビルド完了後の提出
ビルドが成功したら、以下で提出します：

```bash
npx eas submit -p ios
```

API Key情報を入力：
- Issuer ID
- Key ID
- AuthKey_XXXX.p8 のパス

## 📝 変更内容

### package.json
- `expo`: `~49.0.0` → `~51.0.39`
- `react-native`: `0.72.10` → `0.74.5`
- すべての依存関係がSDK 51互換バージョンに更新

### eas.json
- `production`プロファイルに`ios.image: "latest"`を追加
- これにより、最新のXcode 16ビルド環境が使用されます

### app.json
- `expo-localization`プラグインが自動追加されました

## ⚠️ 注意事項

- ビルドには数分〜20分程度かかる場合があります
- ビルド中はEASのダッシュボードで進捗を確認できます
- ビルドが成功したら、必ず新しいビルドを提出してください（古いSDK 49のビルドは提出できません）
