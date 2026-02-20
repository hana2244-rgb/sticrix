# GitHub 連携手順

## 1. GitHub でリポジトリを作成

1. [GitHub](https://github.com) にログイン
2. **+** → **New repository**
3. **Repository name**: 例）`sticrix` または `sticrix-expo`
4. **Public** を選択（Private でも可）
5. **Add a README file** は**付けない**（既存のローカルを push するため）
6. **Create repository** をクリック
7. 表示される **Repository URL** をコピー  
   例）`https://github.com/あなたのユーザー名/sticrix.git` または  
   `git@github.com:あなたのユーザー名/sticrix.git`

---

## 2. ローカルでリモートを追加して push

ターミナルで **C:\ws\sticrix** にいる状態で実行してください。

```powershell
# リモートを追加（URL はあなたのリポジトリURLに置き換え）
git remote add origin https://github.com/あなたのユーザー名/sticrix.git

# 現在のブランチを確認（main または master）
git branch

# 初回 push（ブランチ名が main の場合）
git push -u origin main
```

ブランチ名が **master** の場合は次のようにします。

```powershell
git push -u origin master
```

**HTTPS** のときは push 時に GitHub のユーザー名とパスワード（または Personal Access Token）の入力が求められます。  
**SSH**（`git@github.com:...`）を使う場合は、あらかじめ [SSH キーを GitHub に登録](https://docs.github.com/ja/authentication/connecting-to-github-with-ssh)しておいてください。

---

## 3. 2回目以降の push

```powershell
git add .
git commit -m "メッセージ"
git push
```

---

## 4. Codemagic と連携する場合

GitHub に push したリポジトリを Codemagic でビルドするには:

1. [Codemagic](https://codemagic.io) にログイン
2. **Add application** → **GitHub** を選択
3. 対象のリポジトリ（例: sticrix）を選んで接続
4. `codemagic.yaml` が検出され、**main** / **master** への push で iOS ビルドが走るようになります

詳細は [docs/CODEMAGIC_SETUP.md](./CODEMAGIC_SETUP.md) を参照してください。
