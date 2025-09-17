class PuzzleDropScene extends BaseScene{
  constructor(){ super('PuzzleDropScene'); }
  create(){
    const c = Core.center(this);
    this.add.text(c.x, c.y, 'Puzzle Drop (MVP)', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
  }
}
window.PuzzleDropScene = PuzzleDropScene;
