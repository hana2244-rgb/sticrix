# EAS Submit 実行ガイド

## ✅ 現在の状態
- ✅ EAS Build成功（Build ID: `a6336af0-af0c-4918-99a9-f0bd498cc670`）
- ✅ .ipaファイル生成済み
- ✅ Build number: 2
- ✅ Version: 1.0.0

## 🚀 EAS Submit実行手順

### 1. API Key作成の確認
App Store Connect API Keyが作成済みであることを確認してください。
以下の3つの情報が必要です：
- Issuer ID
- Key ID
- AuthKey_XXXX.p8 ファイルのパス

### 2. Submitコマンドの実行

```bash
cd C:\sticrix-expo
npx eas submit -p ios
```

### 3. 対話的な入力
コマンド実行後、以下の情報を入力します：

1. **Which build would you like to submit?**
   - 最新のビルドを選択（通常は最初のオプション）

2. **Issuer ID**
   - App Store Connectで取得したIssuer IDを入力
   - 例: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

3. **Key ID**
   - App Store Connectで取得したKey IDを入力
   - 例: `ABC123DEF4`

4. **Path to .p8 file**
   - AuthKey_XXXX.p8ファイルのフルパスを入力
   - 例: `C:\sticrix-expo\auth\AuthKey_ABC123DEF4.p8`

### 4. 自動提出
EAS Submitが自動的に：
- .ipaファイルをダウンロード
- App Store Connectにアップロード
- 処理状況を表示

## ⚠️ トラブルシューティング

### main.jsbundle does not exist エラーが出た場合
```bash
npx expo export --platform ios
```
を実行してから、再度 `npx eas submit -p ios` を実行してください。

### Apple側のInternal Server Error
- Apple側のサーバー不調の可能性があります
- 時間を置いて（30分〜1時間後）再度実行してください
- エラーメッセージを確認し、必要に応じて再試行

### API Key関連のエラー
- Issuer ID、Key ID、.p8ファイルパスが正しいか確認
- .p8ファイルが存在するか確認
- Account HolderまたはAdmin権限があるか確認

## 📝 提出後の次のステップ
1. App Store Connectでアプリ情報を入力
   - スクリーンショット
   - 説明文
   - 年齢制限など
2. 審査提出
