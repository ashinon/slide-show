/**
 * スライダークラス
 */
export default class Slider {
  /**
   * constructor
   * @param {HTMLElement} target
   * @param {object} slideContents
   * @param {number} ms
   * @param {number} loopLimit
   * @param {boolean} dispTileList
   */
  constructor(target, slideContents, ms = 4500, loopLimit = 1, dispTileList = false) {
    this.target = target;
    this.playSpeed = ms;
    this.limit = loopLimit;
    this.dispTitleList = dispTileList;
    this.screen = this.target.querySelector('.slideScreen');
    this.prev = this.target.querySelector('.slidePrev');
    this.next = this.target.querySelector('.slideNext');
    this.slideNaviList = this.target.querySelector('.slideNaviList');
    this.contentIdPrefix = 'slideContents_';
    this.clickBtn = true;
    this.current = 0; // 現在のスライド
    this.allSlideCount = 0; // スライドの総数
    this.playCount = 0; // オートプレイのカウント
    this.contents = [];
    this.setSlider(slideContents);
  }

  /**
   * スライダーを作る
   * @param {obj} slideContents
   */
  setSlider(slideContents) {
    this.maskSlideScreen();
    this.convertToElem(slideContents);
    this.hideScreenLoader(slideContents).catch(error => console.error(error.message));
    this.setFirstContent(this.contents[0]);
    this.setPrevsEvent();
    this.setNextsEvent();
    this.addEventTouch();
    this.addEventScreenClick();
    this.autoPlay();
  }

  /**
   * スライダー表示エリアを読み込み中表示(ローダー)で隠す
   * @param {HTMLElement} toMask
   */
  maskSlideScreen() {
    this.screen.insertAdjacentHTML(
      'beforeend',
      '<div class="slide-contents box-for-loading"><div class="slideshow-loading-all">Loading...</div></div>'
    );
  }

  /**
   * JsonデータからHTMLエレメントを生成する
   * @param {array} json
   */
  convertToElem(json) {
    // タイトルリスト部分のスタイルを設定する
    if (this.dispTitleList) {
      this.slideNaviList.classList.add('titleList');
    } else {
      this.slideNaviList.classList.add('indicator');
    }

    json.forEach((page, i) => {
      // リストタグを作る
      const list = this.createNaviElem(page, i);

      // コンテンツ表示部分を作る
      let screen = document.createElement('div');
      screen.setAttribute('id', this.contentIdPrefix + i);
      screen.classList.add('slide-contents');
      if (page.styles) {
        Object.keys(page.styles).forEach(styleName => {
          screen.style.setProperty(styleName, page.styles[styleName], '');
        });
      }
      if (page.classes) {
        page.classes.forEach(child => {
          screen.classList.add(child);
        });
      }

      // コンテンツを作る
      const contents = document.createElement('div');
      page.contents.forEach(part => {
        let elem = this.buildElems(part);

        // 画像表示用の要素の場合
        if (elem.classList.contains('has-bg-img')) {
          // コンテナを作る
          const imgContainer = document.createElement('div');
          imgContainer.classList.add('img-container');
          // ローダーを付ける
          const loader = this.createLoader();
          imgContainer.appendChild(loader);
          imgContainer.appendChild(elem);
          elem = imgContainer;
        }
        contents.appendChild(elem);
      });

      // コンテンツ表示部分に格納する
      screen.appendChild(contents);
      this.contents.push(screen);

      // タイトルリストのクリックイベントを設定する
      this.setListClickEvent(list, i);
    });
    this.allSlideCount = this.contents.length;
  }

  /**
   * スライドのタイトルリストを作る
   * @param {str} page
   * @param {num} idx
   * @return {obj}
   */
  createNaviElem(page, idx) {
    const list = document.createElement('li');
    this.listIdPrefix = 'slideLbl_';
    list.setAttribute('id', this.listIdPrefix + idx);
    if (!idx) {
      list.classList.add('selected');
    }
    if (this.dispTitleList) {
      list.textContent = page.title;
    }
    this.slideNaviList.appendChild(list);
    return list;
  }

  /**
   * スライダーメインコンテンツを作る
   * @param {obj} part
   * @return {HTMLElement}
   */
  buildElems(part) {
    if (!part.tag) {
      throw new Error('タグが指定されていません');
    }
    let elem = this.createTag(part);
    // スタイルを付与する
    if (this.hasProperty(part, 'styles')) {
      Object.keys(part.styles).forEach(styleName => {
        elem.style.setProperty(styleName, part.styles[styleName], '');
      });
    }
    // クラスを付与する
    if (this.hasProperty(part, 'classes')) {
      part.classes.forEach(child => {
        elem.classList.add(child);
      });
    }
    return elem;
  }

  /**
   * 指定されたタグを生成する
   * @param {obj} part
   * @return {HTMLElement}
   */
  createTag(part) {
    // tagで指定された要素を作る
    let elem;
    switch (part.tag) {
      case 'dl':
        elem = document.createElement(part.tag);
        part.list.forEach(child => {
          const div = document.createElement('div');
          const dt = document.createElement('dt');
          const dd = document.createElement('dd');
          dt.textContent = child.dt;
          dd.textContent = child.dd;
          div.appendChild(dt);
          div.appendChild(dd);
          elem.appendChild(div);
        });
        break;
      case 'ul':
        elem = document.createElement(part.tag);
        part.list.forEach(child => {
          const li = document.createElement('li');
          li.textContent = child;
          elem.appendChild(li);
        });
        break;
      case 'ol':
        elem = document.createElement(part.tag);
        part.list.forEach(child => {
          const li = document.createElement('li');
          li.textContent = child;
          elem.appendChild(li);
        });
        break;
      case 'img':
        // 背景画像ありのdivにする
        elem = document.createElement('div');
        elem.style.setProperty('background-image', 'url(' + part.src + ')');
        elem.style.setProperty('display', 'none', '');
        // 背景画像用のクラス、ロード時の監視対象クラスを付与
        elem.classList.add('has-bg-img', 'toBeMonitored');
        elem.src = '';
        break;
      case 'div':
        elem = document.createElement(part.tag);
        // 背景画像ありの場合
        if (this.hasProperty(part.styles, 'background-image')) {
          // 背景画像用のクラス、ロード時の監視対象のクラスを付与
          elem.classList.add('has-bg-img', 'toBeMonitored');
          elem.style.setProperty('display', 'none', '');
        }
        // textContentを挿入
        if (part.textContent) elem.insertAdjacentHTML('beforeend', part.textContent);
        break;
      default:
        elem = document.createElement(part.tag);
        if (part.textContent) elem.insertAdjacentHTML('beforeend', part.textContent);
        break;
    }
    return elem;
  }


  /**
   * 全画像をキャッシュに保存し終わったタイミングで読み込み中表示を解除
   * @param {obj} slideContents
   */
  async hideScreenLoader(slideContents) {
    let json = JSON.parse(JSON.stringify(slideContents));
    await this.savedInCache(json);
    // キャッシュに保存し終わったらローダーを非表示にする
    const target = this.screen.querySelector('.box-for-loading');
    target.style.display = 'none';
  }

  /**
   * 全ページの画像を全て読み込む
   * @param {array} json
   */
  savedInCache(json) {
    const urls = [];
    const tmpContainer = document.createElement('div');
    json.forEach(page => {
      page.contents.forEach(part => {
        if (part.styles) {
          if (Object.keys(part.styles).includes('background-image')) {
            let url = part.styles['background-image'];
            url = url.replace(/^url\(([^\\]+?.[a-z A-Z]+?)\)/, '$1');
            urls.push(url);
          }
        }
      });
    });
    urls.forEach((url, i) => {
      const img = document.createElement('img');
      img.src = url;
      img.width = img.height = 1;
      tmpContainer.appendChild(img);
      window.addEventListener(
        'load',
        () => {
          if (i == urls.length - 1) {
            tmpContainer.remove();
          }
        },
        { once: true }
      );
    });
  }

  /**
   * JsonデータからHTMLエレメントを生成する
   * @param {HTMLElement} page
   */
  setFirstContent(page) {
    this.screen.appendChild(page);
    this.hideLoader();
  }

  /**
   * list押下時のイベントをセット
   * @param {object} list
   * @param {number} length
   * @param {number} showTarget
   * @param {number} hideTarget
   */
  setListClickEvent(list, showTarget) {
    list.addEventListener('click', () => {
      for (let j = 0; j < this.slideNaviList.children.length; j++) {
        this.slideNaviList.children[j].classList.remove('selected');
      }
      list.classList.add('selected');
      this.current = parseInt(list.id.split('_')[1]);

      this.setScreenStyleBefore();
      this.screen.textContent = null;
      this.screen.appendChild(this.contents[showTarget]);
      this.changeScreenStyle();
      this.hideLoader();
    });
  }

  /**
   * prev押下時のイベントをセット
   */
  setPrevsEvent() {
    this.prev.addEventListener('click', () => {
      if (this.clickBtn === true) {
        this.clickBtn = false;
        this.setScreenStyleBefore();

        this.slideNaviList.children[this.current].classList.remove('selected');
        this.current--;
        if (this.current < 0) {
          this.current = this.contents.length - 1;
        }
        this.slideNaviList.children[this.current].classList.add('selected');

        this.screen.textContent = null;
        this.screen.appendChild(this.contents[this.current]);
        this.changeScreenStyle();
        this.hideLoader();
      } else {
        return false;
      }
    });
  }

  /**
   * next押下のイベントをセット
   */
  setNextsEvent() {
    this.next.addEventListener('click', () => {
      if (this.clickBtn === true) {
        this.clickBtn = false;
        this.setScreenStyleBefore();

        this.slideNaviList.children[this.current].classList.remove('selected');
        this.current++;
        if (this.current > this.contents.length - 1) {
          this.current = 0;
        }
        this.slideNaviList.children[this.current].classList.add('selected');

        this.screen.textContent = null;
        this.screen.appendChild(this.contents[this.current]);
        this.changeScreenStyle();
        this.hideLoader();
      } else {
        return false;
      }
    });
  }

  /**
   * スライド部分の変化直前スタイル
   */
  setScreenStyleBefore() {
    this.clickBtn = true;
    this.screen.style.opacity = 0.2;
    this.screen.style.transitionDuration = '';
  }

  /**
   * スライド部分のリストor矢印クリック時のスタイル
   */
  changeScreenStyle() {
    setTimeout(() => {
      this.screen.style.opacity = 1;
      this.screen.style.transitionDuration = 700 + 'ms';
      this.clickBtn = true;
    }, 20);
  }

  /**
   * オートプレイ
   */
  autoPlay() {
    if (this.limit > 0) {
      this.intarval = setInterval(() => {
        this.next.click();
        this.playCount++;
        if (this.limit * this.allSlideCount <= this.playCount) {
          clearInterval(this.intarval);
        }
      }, this.playSpeed);
    }
  }

  /**
   * スワイプに応じたイベントを付与する
   */
  addEventTouch() {
    this.screen.addEventListener(
      'touchstart',
      event => {
        this.touchStartX = event.changedTouches[0].pageX;
      },
      { passive: true }
    );
    this.screen.addEventListener(
      'touchmove',
      event => {
        this.touchMoveX = event.changedTouches[0].pageX;
      },
      { passive: true }
    );
    this.screen.addEventListener(
      'touchend',
      () => {
        this.swipeDist = 30;
        // 方向判定&移動量判定
        if (
          this.touchStartX > this.touchMoveX &&
          this.touchStartX > this.touchMoveX - this.swipeDist
        ) {
          this.next.click();
        } else if (
          this.touchStartX < this.touchMoveX &&
          this.touchStartX < this.touchMoveX + this.swipeDist
        ) {
          this.prev.click();
        }
      },
      { passive: true }
    );
  }

  /**
   * スクリーンクリック時のイベントを付与する
   */
  addEventScreenClick() {
    this.screen.addEventListener(
      'click',
      () => {
        // オートプレイ中だったら止める
        if (this.limit && this.limit * this.allSlideCount >= this.playCount) {
          clearInterval(this.intarval);
        }
      },
      { passive: true }
    );
  }

  /**
   * ローダーを付与する
   * @return {HTMLElement}
   */
  createLoader() {
    let elem = document.createElement('div');
    elem.classList.add('preLoading');
    elem.style.setProperty('display', 'block', '');
    elem.insertAdjacentHTML('beforeend', 'Loading...');
    return elem;
  }

  /**
   * 背景画像読み込み完了時に読み込み中アニメーションを非表示(個別画像用)
   */
  hideLoader() {
    const bgPhotos = this.screen.querySelectorAll('.toBeMonitored');
    bgPhotos.forEach(bgPhoto => {
      let url = bgPhoto.style.getPropertyValue('background-image');
      if (url !== '') {
        url = url.replace(/^url\("(.+?)"\)/, '$1').replace(/(.+?)$/, '$1');
      }
      const img = document.createElement('img');
      img.src = url;
      img.width = img.height = 1;
      img.onload = () => {
        img.remove();
        // .preLoadingで隠れていた要素
        const nextElem = bgPhoto.previousElementSibling;
        nextElem.style.display = 'none';
        bgPhoto.style.display = '';
      };
    });
  }

  /**
   * プロパティの存在チェック
   * @param {obj} obj
   * @param {str} key
   * @return {bool}
   */
  hasProperty(obj, key) {
    return !!obj && Object.prototype.hasOwnProperty.call(obj, key);
  }
}
