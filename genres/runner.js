class RunnerScene extends BaseScene{
  constructor(){ super('RunnerScene'); }
  create(){
    const c = Core.center(this);
    this.add.text(c.x, c.y, 'Runner (MVP)', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
  }
}
window.RunnerScene = RunnerScene;
