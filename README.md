# Watson Diet Trainer

## はじめに  
「さわってみようWatson on Bluemix」(IBM) の Node-RED のアプリをベースに、次の変更をしました。
* Node-RED から Node.js に移植
* Dialog の廃止に伴い、当該機能を削除
* Text to Speech によるテキストの読上げ機能を追加 (PC の Chrome、Firefox に対応)  
* Google Speech API による音声認識機能を追加 (PC の Chrome に対応)  
* 管理機能を追加
    - コンテンツ参照
    - トレーニングデータ抽出
    - Natural Language Classifier 操作用GUI

## 使い方  
* Q&Aシステムは次のURLにアクセスしてください。
  - https://watson-diet-trainer.au-syd.mybluemix.net/
* 管理機能は次のURLにアクセスしてください。
  - https://watson-diet-trainer.au-syd.mybluemix.net/maintenance.html

## セットアップ
1. 本サイトから watson-diet-trainer アプリをダウンロード (Download ZIP) して解凍してください。ディレクトリ名は watson-diet-trainer-master から watson-diet-trainer に変更してください。

1. Bluemix コンソールから CFアプリケーション (Node.js) を作成してください。以下の ippei0605 はご自身のユーザ名などに変更してください。  
アプリケーション名: watson-diet-trainer-ippei0605 (任意)  

    > 以降、watson-diet-trainer-ippei0605 で説明します。

1. CF および Bluemix コマンド・ライン・インターフェースをインストールしていない場合は、インストールしてください。 (Mac OS Sierra は CF v6.22.0以上にしないとコマンドの実行途中でフリーズします。)

1. Cloudant NoSQL DB を作成し、watson-diet-trainer-ippei0605 にバインドしてください。  
サービス名: 任意  
プラン: 任意 (デモアプリは Lite を選択)  

1. Natural Language Classifier を作成し、watson-diet-trainer-ippei0605 にバインドしてください。  
サービス名: 任意  

1. Text to Speech を作成し、watson-diet-trainer-ippei0605 にバインドしてください。  
サービス名: 任意 

1. 解凍したディレクトリ (line-bot アプリのホーム) に移動してください。

        > cd watson-diet-trainer

1. Bluemixに接続してください。

        > bluemix api https://api.au-syd.bluemix.net
    
1. Bluemix にログインしてください。

        > bluemix login -u ippei0605@gmail.com -o jiec_gitou -s dev

1. アプリをデプロイしてください。

        > cf push watson-diet-trainer-ippei0605
                
1. Classifier を作成します。(トレーニング) ここまでの手順でコンテンツは Cloudant にロード済みです。次にアクセスしてください。
        
        > https://watson-diet-trainer-ippei0605.au-syd.mybluemix.net/maintenance.html

    * Database メニューで export training-csv を選択、ダウンロードボタンをクリックしてください。
    * Classifier メニューをクリックしてください。
    * Create classifier でファイルをアップロード、確認ダイアログで OK をクリックしてください。Classifier が Training 状態でリストに追加されます。Available になるまで15分程度かかります。 

1. Bluemix コンソールから CF アプリの環境変数 (ユーザー定義) を設定します。次の変数を設定してください。
    * CLASSIFIER_ID : 前の手順でトレーニングした classifier_id の値をセット


## ファイル構成  
    watson-diet-trainer
    │  .cfignore
    │  .gitignore
    │  app.js                 アプリ
    │  package.json
    │  readme.md
    │
    ├─install
    │      answer.json        コンテンツ (データ)
    │      list.function      Cloudant のマップファンクション
    │      postinstall.js     インストール後処理 (データベース、設計文書、コンテンツ作成)
    │
    ├─models
    │      watson.js          モデル
    │
    ├─public
    │      chatbot.css
    │      classifier.js            Classifier クライアント JavaScript
    │      favicon.ico
    │      index.js                 クライアント JavaScript
    │      maintenance.html         メンテナンス画面
    │      mybootstrap.css
    │      watson_black_animate.gif
    │      
    ├─routes
    │      answer.js          ルーティング (DB参照)
    │      classifier.js      ルーティング (Natural Language Classifier 管理)
    │      index.js           ルーティング
    │      
    ├─views
    │      classifier.ejs     管理画面
    │      index.ejs          Chatbot 画面
    │      
    └─utils
           context.js         コンテキスト

## データベース  
- データベース名: answer
- デザイン文書
  - _design/answers/list : 一覧表示 (ビュー) に使用
- 文書構成  

|データ項目      |必須|説明        |
|--------------|---|-----------|
|_id           |◯ |Document ID: NLC のクラス名|
|_rev          |◯ |Document revision: ユニーク文字列がセットされる。更新、削除時は _id、_rev 指定が必要|
|message       |◯ |メッセージ|
|questions     |   |NLC のテキスト (配列)|

## ルート (URLマッピング)  
|Action|Method|処理|
|---|-----------|-----------|
|/|GET|Chatbot 画面を表示する。|
|/ask|GET|Natural Language Classifier で質問をクラス分類して、回答を返す。|
|/ask-classname|GET|クラス名指定により回答を返す。(定型文に使用)|
|/text-to-speech|GET|音声データを返す。|
|/answer|GET|answer の全コンテンツを返す。|
|/answer/csv|GET|answer の全コンテンツを対象とした Natural Language Classifier　のトレーニングデータを返す。|
|/classifier|GET|登録済みの Classifier の一覧を返す。|
|/classifier|POST|Classifier を新規登録して結果を返す。(トレーニング)|
|/classifier/:id/|GET|Classifier のステータスを返す。|
|/classifier/:id/delete|GET|Classifier を削除して結果を返す。|
|/classifier/:id/classify|GET|クラス分類して結果を返す。|
