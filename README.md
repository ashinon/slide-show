# slide-show

JSON からスライドショーを作れるモジュールです。
スライドショーの内容、要素を生成する場所、
その他設定値をインスタンス生成時に指定出来るようにしています。
依存ライブラリはなしで単一モジュールで動くように作りました。

# DEMO

<https://ashinon.github.io/slide-show>

# Features

JSON に要素名を指定すればその要素が真ん中のスライド部分に表示されます。
スタイルも付けられます。

## ex.

以下のような JSON を渡すと

`{ "name": "h3", "data": "タイ旅行のおもいで" }`

↓

以下のようなタグが生成されます。

```html:sample
<h3>タイ旅行のおもいで</h3>
```

指定した HTML エレメントは、1 つのスライドの中に上から順に幅 100％で表示されます。

# Usage

1. スライダーモジュールをインポートします。

```
import Slider from './slider.js';
```

2. スライダーを表示するエレメント、内容、その他設定値を指定してクラスを New します。

```
const target = document.querySelector('#wrapper');
const contents = [
  {
    "contents": [
      {
        "name": "h3",
        "data": "タイ旅行のおもいで"
      }
    ]
  }];
const ms = 6000;
const dispTileList = false;
const loopLimit = 20;
this.slider = new Slider(target, contents, ms, loopLimit, dispTileList);
```

3. スライダーが表示されます。

# Note

現在、以下の要素は指定出来ます。

div, span, img, p, a, h1, h2, h3, h4, ...
