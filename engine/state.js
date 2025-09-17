// 全ジャンル共通のベースシーン
class BaseScene extends Phaser.Scene {
  constructor(key){ super(key); }
  preload(){ AssetLoader.preload(this); }
  create(){}
  update(time, delta){}
}
window.BaseScene = BaseScene;
