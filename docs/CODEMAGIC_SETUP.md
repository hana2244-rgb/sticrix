# Codemagic で Sticrix をビルドする手順

## 1. リポジトリを Codemagic に追加

1. [Codemagic](https://codemagic.io) にログインし、**Add application** でリポジトリを追加
2. プロジェクトタイプで **React Native / Expo** を選択
3. ブランチをスキャンし、**Check for configuration file** で `codemagic.yaml` を検出させる

## 2. App Store Connect API Key の登録

1. [App Store Connect](https://appstoreconnect.apple.com) > **ユーザとアクセス** > **統合** > **App Store Connect API**
2. **+** でキーを生成し、**App Manager** 権限を付与。**.p8** をダウンロード（1回のみ）
3. **発行者 ID** と **キー ID** を控える
4. Codemagic > **Team settings** > **Developer Portal** > **Manage keys** > **Add key**
   - .p8 をアップロード、発行者 ID・キー ID を入力
   - **Reference name** を `codemagic` にする（`codemagic.yaml` の `app_store_connect: codemagic` と一致させる）

## 3. iOS コード署名（証明書・プロビジョニングプロファイル）

1. Codemagic > **Team settings** > **codemagic.yaml settings** > **Code signing identities**
2. **iOS certificates**: Apple Distribution 証明書をアップロード、または「Create certificate」で Codemagic に生成させる
3. **iOS provisioning profiles**: Bundle ID `com.Akifumi.H.sticrix` 用の **App Store** 用プロファイルを追加  
   - **Fetch from Developer Portal** で取得するか、手元の .mobileprovision をアップロード
   - **ウィジェット拡張用**に `com.Akifumi.H.sticrix.*` に一致するプロファイルも必要（同じ手順で追加）

## 4. codemagic.yaml の編集

- **APP_ID**: App Store Connect > アプリ **Sticrix** > **一般** > **App 情報** の **Apple ID**（数字）に置き換える
- **email.recipients**: ビルド通知先メールアドレスに変更

## 5. ビルドの実行

- `main` または `master` への push / tag でワークフロー **Sticrix iOS** が起動
- または Codemagic の **Start new build** から手動で開始

## トラブルシュート

- **ワークスペース / スキーム名**: 初回ビルドで「workspace not found」になる場合、ローカルで `npx expo prebuild --platform ios` を実行し、`ios/` 内の `.xcworkspace` 名とスキーム名を確認。`codemagic.yaml` の `XCODE_WORKSPACE` と `XCODE_SCHEME` を合わせる
- **ウィジェットのプロファイル**: 拡張ターゲット用のプロファイルが無いと署名エラーになる。Bundle ID が `com.Akifumi.H.sticrix.*` のプロファイルを Code signing identities に追加する
