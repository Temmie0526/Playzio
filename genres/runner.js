// ---- Runner (improved MVP) ----
class RunnerScene extends BaseScene {
  constructor(){ super('RunnerScene'); }

  create(){
    const p = (window.__PROJECT__ && window.__PROJECT__.params) || {};
    // パラメータ
    this.scrollSpeed = p.scrollSpeed ?? 120;   // px/s
    this.gravity     = p.gravity ?? 900;
    this.jumpSpeed   = p.jumpSpeed ?? 480;     // ジャンプ強化
    const spawnCfg   = p.spawn ?? { gapMin: 80, gapMax: 160 };

    // ワールド設定
    this.physics.world.gravity.y = this.gravity;
    this.W = this.scale.width;
    this.H = this.scale.height;

    // 地面
    this.groundY = Math.floor(this.H * 0.8);
    const ground = this.add.rectangle(this.W/2, this.groundY + 10, this.W, 20, 0x222222).setOrigin(0.5);
    this.physics.add.existing(ground, true);

    // プレイヤー（白い四角）
    this.player = this.add.rectangle(80, this.groundY - 16, 24, 24, 0xffffff).setDepth(10);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, ground);

    // 入力
    this.input.keyboard.on('keydown-SPACE', () => this.tryJump());
    this.input.on('pointerdown', () => this.tryJump());

    // 障害物（広告ブロッカー対策で hazards に名称変更）
    this.hazards = this.add.group();
    // スコア
    this.score = 0;
    this.scoreText = this.add.text(10, 10, 'Score 0', { color:'#ffffff', fontSize:'16px' }).setDepth(20);
    this.add.text(this.W/2, this.H*0.18, 'TAP / SPACE to JUMP', { color:'#bbbbbb', fontSize:'14px' }).setOrigin(0.5);

    // スポーン開始（まず1体、その後ループ）
    this.spawnHazard();
    const baseDelay = (Phaser.Math.Between(spawnCfg.gapMin, spawnCfg.gapMax) / this.scrollSpeed) * 1000;
    this.time.addEvent({
      delay: Math.max(600, baseDelay),
      loop: true,
      callback: () => this.spawnHazard()
    });

    // ゲームオーバーフラグ
    this._ended = false;
  }

  tryJump(){
    if (this.player.body?.blocked.down) {
      this.player.body.setVelocityY(-this.jumpSpeed);
    }
  }

  spawnHazard(){
    // 小さめの赤いブロック（飛び越え可能）
    const w = 20, h = 20;
    const y = this.groundY - h/2;
    const hz = this.add.rectangle(this.W + w, y, w, h, 0xff3333).setDepth(9);
    this.physics.add.existing(hz);
    hz.body.setAllowGravity(false);
    hz.body.setVelocityX(-this.scrollSpeed);
    this.hazards.add(hz);

    // 当たり判定（踏みつけはセーフ）
    this.physics.add.collider(this.player, hz, (player, ob) => {
      if (player.body.velocity.y > 0 && player.y < ob.y) {
        // 上から踏んだ → バウンドして生存
        player.body.setVelocityY(-this.jumpSpeed * 0.5);
      } else {
        this.gameOver();
      }
    });
  }

  update(time, delta){
    if (this._ended) return;

    // スコア加算
    this.score += delta * 0.01;
    this.scoreText.setText('Score ' + Math.floor(this.score));

    // 画面外の障害物を掃除
    this.hazards.getChildren().forEach(o => {
      if (o.x < -50) o.destroy();
    });

    // 落下したらゲームオーバー
    if (this.player.y > this.H + 40) this.gameOver();
  }

  gameOver(){
    if (this._ended) return;
    this._ended = true;

    // 障害物をクリア
    this.hazards.clear(true, true);

    // GAME OVER表示
    this.add.text(this.W/2, this.H/2, 'GAME OVER\nTap or SPACE to Retry', {
      color:'#ffffff', fontSize:'24px', align:'center'
    }).setOrigin(0.5).setDepth(30);

    // 再スタート（リロード不要）
    this.input.once('pointerdown', () => this.scene.restart());
    this.input.keyboard.once('keydown-SPACE', () => this.scene.restart());
  }
}

window.RunnerScene = RunnerScene;
