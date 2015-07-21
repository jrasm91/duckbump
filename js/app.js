var game = new Phaser.Game(720, 500, Phaser.AUTO, 'duckbump-game');

game.state.add('Boot', DuckbumpGame.Boot);
game.state.add('Preloader', DuckbumpGame.Preloader);
game.state.add('MainMenu', DuckbumpGame.MainMenu);
game.state.add('Game', DuckbumpGame.Game);

//  Now start the Boot state.
game.state.start('Boot');
// game.state.start('Game');