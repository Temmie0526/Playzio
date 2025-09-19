// ---- Runner (guaranteed spawns & movement) ----
class RunnerScene extends BaseScene{
  constructor(){ super('RunnerScene'); }

  create(){
    const p = (window.__PROJECT__ && window.__PROJECT__.params) || {};
    // params
    this.scrollSpeed = p.scrollSpeed ?? 120;   // px/s
    this.gravity     = p.gravity ?? 900;
    this.jumpSpeed   = p.jumpSpeed ?? 300;
    const spawnCfg   = p.spawn ?? { gapMin: 80, gapMax: 160 };

    // world
    this.physics.world.gravity.y = this.gravity;
    this.W = this.scale.width;
    this.H = this.scale.height;

    // ground
    this.groundY = Math.floor(this.H * 0.8);
    const ground = this.add.rectangle(this.W/2, this.groundY + 10, this.W, 20, 0x222222).setOrigin(0.5);
    this.physics.add.existing(ground, true);

    // player
    this.player = this.add.rectangle(80, this.groundY - 16, 24, 24, 0xffffff).setDepth(10);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, ground);

    // input
    this.input.keyboard.on('keydown-SPACE', () => this.tryJump());
    this.input.on('pointerdown', () => this.tryJump());

    // obstacles
    this.obstacles = this.add.group(); // 描画グループ（物理は個別付与）
    this.physics.add.overlap(this.player, this.obstacles, () => this.gameOver(), null, this);

    // ui
    this.score = 0;
    this.scoreText = this.add.text(10, 10, 'Score 0', { color:'#ffffff', fontSize:'16px' }).setDepth(20);
    this.helpText  = this.add.text(this.W/2, this.H*0.18, 'TAP / SPACE to JUMP', { color:'#bbbbbb', fontSize:'14px' }).setOrigin(0.5);
    this.debugText = this.add.text(10, 30, 'Obs 0', { color:'#888888', fontSize:'12px' });

    // spawn: まず1個、その後は一定間隔でループ
    this.spawnObstacle();
    const baseDelay = (Phaser.Math.Between(spawnCfg.gapMin, spawnCfg.gapMax) / this.scrollSpeed) * 1000;
    this.spawnEvent = this.time.addEvent({
      delay: Math.max(400, baseDelay), // あまり短すぎないよう下限
      loop: true,
      callback: () => {
        this.spawnObstacle();
        // 次回の間隔をランダム更新（イベントを作り直すより簡便に：一旦remove→addでもOK）
        this.spawnEvent.remove(false);
        const next = (Phaser.Math.Between(spawnCfg.gapMin, spawnCfg.gapMax) / this.scrollSpeed) * 1000;
        this.spawnEvent = this.time.addEvent({
          delay: Math.max(400, next),
          loop: true,
          callback: () => this.spawnObstacle()
        });
      }
    });
  }

  tryJump(){
    if (this.player.body?.blocked.down) {
      this.player.body.setVelocityY(-this.jumpSpeed);
    }
  }

  spawnObstacle(){
    // 見やすい赤い棒
    const w = 24, h = 36;
    const y = this.groundY - h/2;
    const rect = this.add.rectangle(this.W + w, y, w, h, 0xff3333).setDepth(9);
    // 物理ボディ付与（動かなければ手動移動の保険あり）
    this.physics.add.existing(rect);
    rect.body.setAllowGravity(false);
    rect.body.setVelocityX(-this.scrollSpeed);
    rect.__vx = -this.scrollSpeed; // 手動移動用の速度(px/s)
    this.obstacles.add(rect);
  }

  update(time, delta){
    // スコア
    this.score += delta * 0.01;
    this.scoreText.setText('Score ' + Math.floor(this.score));

    // 障害物の移動と掃除（保険として手動でも流す）
    const dt = delta / 1000;
    let count = 0;
    this.obstacles.getChildren().forEach(o => {
      if (!o) return;
      count++;
      // 物理が効かない場合でも流れるように手動でxを減らす
      if (!o.body || !o.body.velocity || o.body.velocity.x === 0){
        o.x += (o.__vx ?? -this.scrollSpeed) * dt;
      }
      // プレイヤーとの当たり（手動保険：重なり簡易判定）
      if (this.player && Phaser.Geom.Intersects.RectangleToRectangle(o.getBounds(), this.player.getBounds())){
        this.gameOver();
      }
      // 画面外掃除
      if (o.x < -50) o.destroy();
    });
    this.debugText.setText('Obs ' + count);

    // 落下チェック
    if (this.player.y > this.H + 40) this.gameOver();
  }

  gameOver(){
    if (this._ended) return;
    this._ended = true;
    this.scene.pause();
    this.add.text(this.W/2, this.H/2, 'GAME OVER\nTap to Retry', {
      color:'#ffffff', fontSize:'24px', align:'center'
    }).setOrigin(0.5).setDepth(30);
    this.input.once('pointerdown', () => this.scene.restart());
    this.input.keyboard.once('keydown-SPACE', () => this.scene.restart());
  }
}

window.RunnerScene = RunnerScene;
