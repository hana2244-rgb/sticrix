# Sticrix の codemagic.yaml で必ず設定すること（捨て写との違い）

捨て写（C:\ws\sutesho）の codemagic.yaml を参考にしているため、**Sticrix 用に次の箇所を必ず確認・変更**してください。

---

## 必須で変更する項目

| 項目 | 捨て写の値 | Sticrix 用にすること |
|------|------------|------------------------|
| **APP_ID / Apple ID** | `6758648167`（捨て写の App） | **Sticrix** の App Store Connect > アプリ > **一般** > **App 情報** の **Apple ID**（数字）に置き換える。`codemagic.yaml` の `APP_STORE_APPLE_ID` または `APP_ID` をこの数字にする。 |
| **app_store_connect のキー名** | `Codemagic_App` | Codemagic の **Teams** → **Integrations** → **Manage keys** で登録した **App Store Connect API キーの名前**と完全一致させる。捨て写と同じキーを使うなら `Codemagic_App`、別名ならその名前にする。 |
| **bundle_identifier** | `com.Akifumi.H.trashsnap` | Sticrix は **`com.Akifumi.H.sticrix`** のまま（すでに正しい）。ウィジェット用に **`com.Akifumi.H.sticrix.*`** のプロファイルも Code signing identities に必要。 |
| **XCODE_WORKSPACE / XCODE_SCHEME** | 捨て写は `sutesho.xcworkspace` / `sutesho` | Sticrix は **`Sticrix.xcworkspace`** / **`Sticrix`**（app.json の `name: "Sticrix"` に合わせている）。変更不要。 |

---

## 推奨：捨て写と同じにしたい場合

- **ビルド番号**  
  捨て写は `scripts/bump-ios-build.js` で **prebuild 前に** app.json の `ios.buildNumber` を TestFlight 最新+1 にしています。Sticrix では現在、prebuild 後に `agvtool` で番号を変えているので、どちらか一方の方式に揃えるとよいです。
- **ワークスペース・スキームの自動検出**  
  捨て写は `find ios -maxdepth 1 -name "*.xcworkspace"` でワークスペースを探し、その名前をスキームに使っています。Sticrix でも同じようにすると、prebuild で名前が変わっても動きます。
- **TestFlight 自動提出**  
  捨て写は `submit_to_testflight: true` でビルド後に TestFlight へ自動提出しています。Sticrix でも同じにしたい場合はこのフラグを追加します。
- **メール通知**  
  `email.recipients` の `user@example.com` を、実際に受け取りたいメールアドレスに変更してください。

---

## まとめ：今すぐやること

1. **codemagic.yaml** の **APP_ID**（または APP_STORE_APPLE_ID）を、**Sticrix の App Store Connect の Apple ID** に書き換える。
2. **app_store_connect:** の値を、Codemagic に登録した **API キー名**（捨て写と同じなら `Codemagic_App`）に合わせる。
3. **email.recipients** を自分のメールアドレスに変更する。
4. （任意）捨て写と同じく、ワークスペース自動検出・TestFlight 提出・ビルド番号スクリプトを取り入れる。
