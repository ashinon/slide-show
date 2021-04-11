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
   * @param {string} imgPath 背景画像ありの要素を使用する場合にファイル名より前のパスを設定する
   */
  constructor(
    target,
    slideContents,
    ms = 4500,
    loopLimit = 1,
    dispTileList = false,
    imgPath = 'dist/img/'
  ) {
    this.target = target;
    this.playSpeed = ms;
    this.limit = loopLimit;
    this.dispTitleList = dispTileList;
    this.imgPath = imgPath;
    this.screen = this.target.querySelector('.slideScreen');
    this.prev = this.target.querySelector('.slidePrev');
    this.next = this.target.querySelector('.slideNext');
    this.slideNaviList = this.target.querySelector('.slideNaviList');
    this.clickBtn = true;
    this.current = 0; // 現在のスライド
    this.allSlideCount = 0; // スライドの総数
    this.playCount = 0; // オートプレイのカウント
    this.contents = [];
    this.convertToElem(slideContents);
    this.setSlider();
    this.hideLoadingAnime();
  }

  /**
   * 背景画像読み込み完了時に読み込み中アニメーションを非表示
   */
  hideLoadingAnime() {
    const bgPhotos = this.screen.querySelectorAll('.toBeMonitored');
    const imgPath = this.imgPath;
    bgPhotos.forEach(bgPhoto => {
      let url =
        bgPhoto.style['background-image'] ||
        window.getComputedStyle(bgPhoto, '')['background-image'];
      if (imgPath) {
        url = url.replace(/^url.+?img\/([^/]+?)"\)/, '$1').replace(/(.+?)$/, imgPath + '$1');
      } else {
        url = url.replace(/^url.+?img\/([^/]+?)"\)/, '$1').replace(/(.+?)$/, '$1');
      }
      const img = document.createElement('img');
      img.src = url;
      img.width = img.height = 1;
      bgPhoto.appendChild(img);
      img.onload = () => {
        bgPhoto.querySelector('.preLoading').style.display = 'none';
        bgPhoto.removeChild(img);
      };
    });
  }

  /**
   * スライダー
   */
  setSlider() {
    this.setPrevsEvent();
    this.setNextsEvent();
    this.addEventTouch();
    this.addEventScreenClick();
    this.autoPlay();
  }

  /**
   * JsonデータからHTMLエレメントを生成する
   * @param {array} dataList
   */
  convertToElem(dataList) {
    // タイトルリスト部分のスタイルを設定する
    if (this.dispTitleList) {
      this.slideNaviList.classList.add('titleList');
    } else {
      this.slideNaviList.classList.add('indicator');
    }

    dataList.forEach((data, i) => {
      // リストタグを作る
      const list = this.createNaviElem(data, i);

      // コンテンツ表示部分を作る
      const screen = document.createElement('div');
      this.contentIdPrefix = 'slideContents_';
      screen.setAttribute('id', this.contentIdPrefix + i);
      screen.classList.add('slide-contents');
      if (data.styles) {
        Object.keys(data.styles).forEach(styleName => {
          screen.style[styleName] = data.styles[styleName];
        });
      }

      // コンテンツを作る
      const contents = document.createElement('div');
      data.contents.forEach(content => {
        let elem = this.createContentsElem(content);
        contents.appendChild(elem);
      });

      // コンテンツ表示部分に格納する
      screen.appendChild(contents);
      this.contents.push(screen);
      if (i === 0) {
        this.screen.appendChild(screen);
      }
      // タイトルリストのクリックイベントを設定する
      this.setListClickEvent(list, i);
    });
    this.allSlideCount = this.contents.length;
  }

  /**
   * スライドのタイトルリストを作る
   * @param {str} data
   * @param {num} idx
   * @return {obj}
   */
  createNaviElem(data, idx) {
    const list = document.createElement('li');
    this.listIdPrefix = 'slideLbl_';
    list.setAttribute('id', this.listIdPrefix + idx);
    if (!idx) {
      list.classList.add('selected');
    }
    if (this.dispTitleList) {
      list.textContent = data.title;
    }
    this.slideNaviList.appendChild(list);
    return list;
  }

  /**
   * スライダーメインコンテンツを作る
   * @param {obj} content
   * @return {obj}
   */
  createContentsElem(content) {
    let elem;
    const listElems = { ul: 'li', ol: 'li', dl: { dt: 'dd' } };
    if (Object.keys(listElems).includes(content.name)) {
      // リストエレメントの生成
      elem = document.createElement(content.name);
      content.data.forEach(child => {
        const li = document.createElement(listElems[content.name]);
        li.textContent = child;
        elem.appendChild(li);
      });
    } else {
      // リストエレメント以外の生成
      elem = document.createElement(content.name);
      if (content.data) elem.insertAdjacentHTML('beforeend', content.data);
      if (content.styles) {
        Object.keys(content.styles).forEach(styleName => {
          elem.style[styleName] = content.styles[styleName];
          if (styleName == 'background-image') {
            // background-imageの指定がある要素の場合、ローダーを設定する
            elem.style['display'] = 'flex';
            elem.style['justify-content'] = 'center';
            elem.style['align-items'] = 'center';
            elem.classList.add('toBeMonitored');
            elem.insertAdjacentHTML('beforeend', '<div class="preLoading">Loading...</div>');
          }
        });
      }
      if (content.classList) {
        content.classList.forEach(child => {
          elem.classList.add(child);
        });
      }
    }
    return elem;
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
      this.hideLoadingAnime();
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
        this.hideLoadingAnime();
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
        this.hideLoadingAnime();
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
}
