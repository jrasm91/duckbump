DuckbumpGame.MainMenu = function (game) {
  this.music = null;
  this.playButton = null;
};

DuckbumpGame.MainMenu.prototype = {

  create: function () {
    this.add.text(this.game.width / 2, this.game.height / 2 - 100, "DUCKBUMP", {
      font: "48px pixalFont",
      fill: "#c4c400",
      align: "center"
    }).anchor.setTo(0.5, 0.5);
    this.loadingText = this.add.text(this.game.width / 2, this.game.height / 2 + 100, "Click to Start...", {
      font: "20px pixalFont",
      fill: "#fff"
    });
    this.loadingText.anchor.setTo(0.5, 0.5);
  },

  update: function () {
    if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || this.input.activePointer.isDown) {
      this.startGame(this);
    }
  },
  startGame: function (game) {
    game.state.start('Game');
  }
};