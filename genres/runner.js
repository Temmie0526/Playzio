// ---- Runner (playable MVP) ----
class RunnerScene extends BaseScene{
  constructor(){ super('RunnerScene'); }

  create(){
    const p = (window.__PROJECT__ && window.__PROJECT__.params) || {};
    // パラメータ（project.json の値を使い、なければデフォルト）
    this.scrollSpeed = p.scrollSpeed ?? 120;
    this.gravity     = p.gravity ?? 900;
    this.jumpSpeed   = p.jumpSpeed ?? 300;
    const spawnCfg   = p.spawn ?? { gapMin: 80, gapMax: 160, spikeRate: 0.6, platformRate: 0.4 };

    // 物理
    this.physics.world.gravity.y = this.gravity;

    // 画面サイズ
    this.W = this.scale.width;
    this.H = this.scale.height;

    // 地面（静的）
    this.groundY = Math.floor(this.H * 0.8);
    const ground = this.add.rectangle(this.W/2, this.groundY + 10, this.W, 20, 0x222222).setOrigin(0.5);
    this.physics.add.existing(ground, true); // static

    // プレイヤー（白い四角）
    this.player = this.add.rectangle(80, this.groundY - 16, 24, 24, 0xffffff);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setBounce(0);

    // 当たり判定
    this.physics.add.collider(this.player, ground);

    // 入力（キーボード & タッチ）
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', () => this.tryJump());
    this.input.on('pointerdown', () => this.tryJump());

    // 障害物グループ
    this.obstacles = this.physics.add.group();
    this.physics.add.overlap(this.player, this.obstacles, () => this.gameOver(), null, this);

    // スポーン用タイマー
    this.spawnTimer = 0;
    this.gapMin = spawnCfg.gapMin ?? 80;
    this.gapMax = spawnCfg.gapMax ?? 160;

    // スコア表示
    this.score = 0;
    this.scoreText = this.add.text(10, 10, 'Score 0', { color:'#ffffff', fontSize:'16px' }).setDepth(10);

    // ヘルプ
    this.add.text(this.W/2, this.H*0.18, 'TAP / SPACE to JUMP', { color:'#bbbbbb', fontSize:'14px' }).setOrigin(0.5);
  }

  tryJump(){
    // 接地していたらジャンプ
    if (this.player.body.blocked.down) {
      this.player.body.setVelocityY(-this.jumpSpeed);
    }
  }

  spawnObstacle(){
    // まずは確実に見える「赤い長方形」だけ
    const w = 20, h = 30;
    const y = this.groundY - h/2;
    const obs = this.add.rectangle(this.W + w, y, w, h, 0xff3333);
    this.physics.add.existing(obs);
    obs.body.setAllowGravity(false);
    obs.body.setVelocityX(-this.scrollSpeed);
    obs.isSpike = true;
    this.obstacles.add(obs);
  }

  update(time, delta){
    // スコア
    this.score += delta * 0.01;
    this.scoreText.setText('Score ' + Math.floor(this.score));

    // 障害物スポーン（間隔は gapMin〜gapMax を速度で割り換算）
    this.spawnTimer -= delta;
    if (this.spawnTimer <= 0){
      this.spawnObstacle();
      const pixels = Phaser.Math.Between(this.gapMin, this.gapMax);
      const ms = (pixels / this.scrollSpeed) * 1000;
      this.spawnTimer = ms;
    }

    // 画面外に出た障害物を破棄
    this.obstacles.children.iterate(o => {
      if (!o) return;
      if (o.x < -50) o.destroy();
    });

    // 落下したらゲームオーバー
    if (this.player.y > this.H + 40) this.gameOver();
  }

  gameOver(){
    this.scene.pause();
    const t = this.add.text(this.W/2, this.H/2, 'GAME OVER\nTap to Retry', { color:'#ffffff', fontSize:'24px', align:'center' }).setOrigin(0.5).setDepth(20);
    this.input.once('pointerdown', () => this.scene.restart());
    this.input.keyboard.once('keydown-SPACE', () => this.scene.restart());
  }
}

window.RunnerScene = RunnerScene;
