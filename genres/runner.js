// ---- Runner (playable MVP, guaranteed spawns) ----
class RunnerScene extends BaseScene{
  constructor(){ super('RunnerScene'); }

  create(){
    const p = (window.__PROJECT__ && window.__PROJECT__.params) || {};
    // パラメータ（project.json の値を使い、なければデフォルト）
    this.scrollSpeed = p.scrollSpeed ?? 120;
    this.gravity     = p.gravity ?? 900;
    this.jumpSpeed   = p.jumpSpeed ?? 300;
    const spawnCfg   = p.spawn ?? { gapMin: 80, gapMax: 160 };

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
    this.player = this.add.rectangle(80, this.groundY - 16, 24, 24, 0xffffff).setDepth(10);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // 当たり判定
    this.physics.add.collider(this.player, ground);

    // 入力（キーボード & タッチ）
    this.input.keyboard.on('keydown-SPACE', () => this.tryJump());
    this.input.on('pointerdown',               () => this.tryJump());

    // 障害物グループ
    this.obstacles = this.physics.add.group();
    this.physics.add.overlap(this.player, this.obstacles, () => this.gameOver(), null, this);

    // スコア表示
    this.score = 0;
    this.scoreText = this.add.text(10, 10, 'Score 0', { color:'#ffffff', fontSize:'16px' }).setDepth(20);
    this.add.text(this.W/2, this.H*0.18, 'TAP / SPACE to JUMP', { color:'#bbbbbb', fontSize:'14px' }).setOrigin(0.5);

    // ★ スポーン（即1体＋一定間隔で繰り返し）
    const delayMs = (Phaser.Math.Between(spawnCfg.gapMin, spawnCfg.gapMax) / this.scrollSpeed) * 1000;
    this.spawnObstacle(); // まず1体
    this.time.addEvent({
      delay: delayMs,  // 最初の間隔
      loop: true,
      callbackScope: this,
      callback: () => {
        this.spawnObstacle();
        // 次回以降の間隔を毎回ランダムに更新
        const next = (Phaser.Math.Between(spawnCfg.gapMin, spawnCfg.gapMax) / this.scrollSpeed) * 1000;
        // PhaserのTimerはdelayを直接変更できないため、作り直す
        this.time.addEvent({ delay: next, loop: false, callback: () => this.events.emit('spawn_tick') });
      }
    });
    // spawn_tick を受け取ったら再び spawn＋次タイマー設定
    this.events.on('spawn_tick', () => {
      this.spawnObstacle();
      const next = (Phaser.Math.Between(spawnCfg.gapMin, spawnCfg.gapMax) / this.scrollSpeed) * 1000;
      this.time.addEvent({ delay: next, loop: false, callback: () => this.events.emit('spawn_tick') });
    });
  }

  tryJump(){
    if (this.player.body.blocked.down) {
      this.player.body.setVelocityY(-this.jumpSpeed);
    }
  }

  spawnObstacle(){
    // まずは確実に見える赤い長方形
    const w = 20, h = 30;
    const y = this.groundY - h/2;
    const obs = this.add.rectangle(this.W + w, y, w, h, 0xff3333).setDepth(9);
    this.physics.add.existing(obs);
    obs.body.setAllowGravity(false);
    obs.body.setVelocityX(-this.scrollSpeed);
    this.obstacles.add(obs);
  }

  update(time, delta){
    // スコア
    this.score += delta * 0.01;
    this.scoreText.setText('Score ' + Math.floor(this.score));

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
    this.add.text(this.W/2, this.H/2, 'GAME OVER\nTap to Retry', {
      color:'#ffffff', fontSize:'24px', align:'center'
    }).setOrigin(0.5).setDepth(30);
    this.input.once('pointerdown', () => this.scene.restart());
    this.input.keyboard.once('keydown-SPACE', () => this.scene.restart());
  }
}

window.RunnerScene = RunnerScene;
