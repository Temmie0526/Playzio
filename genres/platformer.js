class PlatformerScene extends BaseScene{
  constructor(){ super('PlatformerScene'); }
  create(){
    const c = Core.center(this);
    this.add.text(c.x, c.y, 'Platformer (MVP)', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
  }
}
window.PlatformerScene = PlatformerScene;
