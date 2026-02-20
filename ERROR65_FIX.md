# iOS Error 65 対処ガイド（プロビジョニングプロファイル不整合）

## 原因
Error 65 は、**プロビジョニングプロファイルとディストリビューション証明書の組み合わせが合っていない**ときに発生します。

SDK 49 → 52 へのアップや、bundleIdentifier の変更などで、以前の認証情報が現在のアプリ設定と一致しなくなっている可能性があります。

## 対処手順

### 1. eas.json の確認（済）
production の iOS ビルドで **`"image": "sdk-52"`** を使用するようにしてあります（Xcode 16.2 用）。

### 2. EAS の iOS 認証情報を再生成する

**ターミナルで以下を実行してください（対話形式です）：**

```bash
cd C:\sticrix-expo
npx eas credentials --platform ios
```

1. **「Build profile:」** → **production** を選択
2. メニューから **「Provisioning Profile: Remove current provisioning profile」** を選択  
   （文言は「Remove」や「Delete」に近い可能性があります）
3. 確認で **Yes** を選ぶ
4. 必要なら **「Distribution Certificate」** も同様に **Remove** してから終了

これで、次回の `eas build` 時に **新しいプロビジョニングプロファイル（と証明書）が自動作成**されます。

### 3. 再ビルド

```bash
npx eas build --platform ios --profile production
```

Apple Developer にログインするか、既存の Apple アカウント連携で、新しいプロファイル・証明書が作成されます。

### 4. まだ Error 65 が出る場合

- **Apple Developer の権限**  
  - 使用している Apple ID が **Account Holder / Admin / App Manager** のいずれかで、証明書・プロファイルを管理できるか確認してください。
- **bundleIdentifier の一致**  
  - `app.json` の `expo.ios.bundleIdentifier`（例: `com.yourname.sticrix`）が、Apple Developer / App Store Connect で登録している App ID と**完全に同じ**か確認してください。
- **証明書も一緒に作り直す**  
  - 上記の `eas credentials --platform ios` で、  
    **「Distribution Certificate: Remove current distribution certificate」** も実行し、プロファイルと証明書の両方を削除してから、再度 `eas build` を実行してください。

## 参考
- [EAS App Signing - Managed credentials](https://docs.expo.dev/app-signing/managed-credentials/)
- [EAS Build - iOS build process](https://docs.expo.dev/build-reference/ios-builds/)
