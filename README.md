# slide-show

JSON からスライドショーを作れるモジュールです。  
スライドショーの内容、要素を生成する場所、その他設定値をインスタンス生成時に指定出来るようにしています。  
依存ライブラリはなしで単一モジュールで動くように作りました。

## DEMO

<https://ashinon.github.io/slide-show>

## Features

JSON に要素名を指定すればその要素が真ん中のスライド部分に表示されます。  
スタイルも付けられます。

例：

以下のような JSON を渡すと

```
[
  {
    "contents": [
      {
        "name": "h3",
        "styles": {"font-weight": "bold", "color": "#666"},
        "data": "タイ旅行のおもいで"
      },
      {
        "name": "p",
        "data": "期間：2019/11/24～27"
      }
    ]
  },
]
```

↓

スライド部分に以下のようなタグが生成されます。

```html:sample
<h3 style="fontweight: bold; color: #666;">タイ旅行のおもいで</h3>
<p>期間：2019/11/24～27</p>
```

指定した HTML エレメントは、デフォルトの CSS では 1 つのスライドの中に上から順に幅 100％で表示されます。

## Usage

1. スライダーモジュールをインポートします。

```
import Slider from './slider.js';
```

2. スライダーを表示するエレメント、内容、その他設定値を指定してクラスを New() します。

```
const target = document.querySelector('#wrapper'); // スライダーを表示させる場所の要素
const contents = [
  {
    "contents": [
      {
        "name": "h3",
        "data": "タイ旅行のおもいで"
      }
    ]
  }];
const ms = 6000; // 次の画面へ切り替わるまでのミリ秒数
const dispTileList = false; // ページネーションの表示方法指定。デフォルト(false)ではグレーのドット
const loopLimit = 20; // オートプレイ再生回数
this.slider = new Slider(target, contents, ms, loopLimit, dispTileList);
```

3. スライダーが表示されます。

## Note

### 表示内容の指定方法について

name に指定する要素に応じて content の指定内容が変わります。

#### name に子要素を伴わないタグを指定する場合

以下のような要素を指定する場合  
`div, span, img, p, a, h1, h2, h3, h4, ...`

→ content には文字列型で内容を記載してください。(html を記載すれば html として表示されます。)  
例：

```
{
  "name": "div",
  "content": "あいうえお<span style="font-size: small;">かきくけこ</span>",
}
```

↓  
`<div>あいうえお<span style="font-size: small;">かきくけこ</span></div>`

#### name にリストタグを指定する場合

以下のリストタグを指定する場合  
`ul, ol`  
→ content には配列型で内容を記載してください。  
例：

```
{
  "name": "ul",
  "content": [
		"いろはにほへと",
		"ちりぬるを"
		]
}
```

↓

```
<ul>
  <li>いろはにほへと</li>
  <li>ちりぬるを</li>
</ul>
```
