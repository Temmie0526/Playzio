class ShmupScene extends BaseScene{
  constructor(){ super('ShmupScene'); }
  create(){
    const c = Core.center(this);
    this.add.text(c.x, c.y, 'Shmup (MVP)', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
  }
}
window.ShmupScene = ShmupScene;
