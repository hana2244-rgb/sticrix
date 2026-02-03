# App Store Connect API Key 作成手順

## 📋 前提条件
- Account Holder または Admin 権限が必要
- Mac不要（ブラウザで完結）

## 🔑 API Key作成手順

### 1. App Store Connectにログイン
https://appstoreconnect.apple.com

### 2. ユーザとアクセス画面へ移動
- 右上のアカウントアイコンをクリック
- 「ユーザとアクセス」を選択

### 3. API Key作成
- 上部のタブまたはメニューから「**統合**」を選択
- 「**App Store Connect API**」セクションを確認
- 「**キーを生成**」または「**Generate API Key**」をクリック

### 4. キー情報の入力
- **名前**: 任意の名前（例: `EAS Submit Key`）
- **アクセス**: 「**App Manager**」または「**Admin**」を選択
- 「**生成**」をクリック

### 5. 取得する情報（重要：一度しか表示されません）
以下の3つの情報を必ずメモまたは保存してください：

1. **Issuer ID**
   - 例: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - 画面に表示されます

2. **Key ID**
   - 例: `ABC123DEF4`
   - 画面に表示されます

3. **AuthKey_XXXX.p8 ファイル**
   - 「**ダウンロード**」ボタンをクリックしてダウンロード
   - **このファイルは一度しかダウンロードできません**
   - 安全な場所に保存してください（例: `C:\sticrix-expo\auth\`）

## ⚠️ 注意事項
- `.p8` ファイルは一度しかダウンロードできません
- ファイルを紛失した場合は、新しいキーを作成する必要があります
- `.p8` ファイルは秘密鍵なので、Gitにコミットしないでください

## 📝 次のステップ
API Key作成後、以下のコマンドでEAS Submitを実行します：

```bash
npx eas submit -p ios
```

コマンド実行時に以下を入力します：
- Issuer ID
- Key ID  
- AuthKey_XXXX.p8 のファイルパス
