(async function () {
  const res = await fetch('./project.json');
  const project = await res.json();
  window.__PROJECT__ = project;

  const cfg = {
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#000000',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 360, height: 640 },
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scene: []
  };

  const map = {
    'platformer': PlatformerScene,
    'puzzle_drop': PuzzleDropScene,
    'runner': RunnerScene,
    'shmup': ShmupScene
  };
  const SceneClass = map[project.genre] || RunnerScene;
  cfg.scene = [SceneClass];

  new Phaser.Game(cfg);
})();
