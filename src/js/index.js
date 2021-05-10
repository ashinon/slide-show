document.addEventListener(
  'DOMContentLoaded',
  () => {
    new Main();
  },
  { once: true }
);
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}

import Slider from './slider.js';
import SlideContents from './slide_contents.json';
/**
 * 画面の表示・イベントのクラス
 */
export default class Main {
  constructor() {
    this.wrapper = document.querySelector('#wrapper');
    this.sections = this.wrapper.querySelectorAll('div.section');
    this.setSliderProp(this.sections[0]);
  }

  /**
   * スライダークラスの呼び出し
   * @param {obj} target スライダーを表示するエレメント
   * @param {number} ms オートプレイのスピード
   */
  setSliderProp(target) {
    const ms = 9000;
    const dispTileList = false;
    const loopLimit = 1;
    this.slider = new Slider(target, SlideContents, ms, loopLimit, dispTileList);
  }
}
