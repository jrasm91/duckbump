DuckbumpGame.Game = function(game) {

};

DuckbumpGame.Game.prototype = {
  preload: function() {
    this.load.image('background', 'img/DuckBumpBackground.jpg');
    this.load.spritesheet('whirlie', 'img/whirlie_sprite.png', 14, 24);
    this.load.spritesheet('greenDuck', 'img/green_sprite.png', 48, 24);
    this.load.image('cookedDuck', 'img/CookedDuck.png', 48, 24);
    // this.load.spritesheet('goldDuck', 'img/gold_sprite.png', 48, 24, 2);

    this.load.spritesheet('explosion', 'img/explosion.png', 32, 32);
    this.load.image('player', 'img/DuckBumpJones.png')
  },

  create: function() {
    this.setupBackground();
    this.setupPlayer();
    this.setupDucks();
    this.setupWhirlies();
    this.setupExplosions();
    this.setupText();
    this.setupPlayerIcons();
    this.setupInput();
  },

  reder: function(){
    // game.debug.renderRectangle(this.player.body);
  },

  setupInput: function(){
    this.cursors = this.input.keyboard.createCursorKeys();
    this.shootKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.shootKey.onDown.add(this.fire, this);
  },

  setupBackground: function() {
    this.background = this.add.sprite(0, 0, 'background');
    this.background.width = this.game.width;
    this.background.height = this.game.height;
  },

  setupPlayer: function() {
    this.player = this.add.sprite(this.game.width / 2, this.game.height - 50, 'player');
    this.player.anchor.setTo(0.5, 0.5);
    this.player.scale.setTo(.8, .8);
    // this.player.animations.add('fly', [0, 1, 2], 20, true);
    // this.player.play('fly');
    this.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.body.collideWorldBounds = true;
    this.player.speed = DuckbumpGame.PLAYER_SPEED;
    this.player.body.setSize(20, 20, 0, -5);
  },

  setupDucks: function() {
    this.dreenDuckPool = this.add.group();
    this.dreenDuckPool.enableBody = true;
    this.dreenDuckPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.dreenDuckPool.createMultiple(50, 'greenDuck');
    this.dreenDuckPool.setAll('anchor.x', 0.5);
    this.dreenDuckPool.setAll('anchor.y', 0.5);
    this.dreenDuckPool.setAll('outOfBoundsKill', true);
    this.dreenDuckPool.setAll('checkWorldBounds', true);
    this.dreenDuckPool.setAll('reward', DuckbumpGame.ENEMY_REWARD, false, false, 0, true);
    this.dreenDuckPool.forEach(function(duck) {
      duck.animations.add('fly', [0, 2, 3, 1], 5, true);
      duck.events.onAnimationComplete.add(function(e) {
        e.play('fly');
      }, this);
    });

    this.nextDuckAt = 0;
    this.duckDelay = DuckbumpGame.SPAWN_ENEMY_DELAY;

    this.cookedDuckPool = this.add.group();
    this.cookedDuckPool.enableBody = true;
    this.cookedDuckPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.cookedDuckPool.createMultiple(50, 'cookedDuck');
    this.cookedDuckPool.setAll('anchor.x', 0.5);
    this.cookedDuckPool.setAll('anchor.y', 0.5);
    this.cookedDuckPool.setAll('outOfBoundsKill', true);
    this.cookedDuckPool.setAll('checkWorldBounds', true);
    this.cookedDuckPool.setAll('reward', DuckbumpGame.ENEMY_REWARD, false, false, 0, true);
  },


  setupWhirlies: function() {
    this.whirliePool = this.add.group();
    this.whirliePool.enableBody = true;
    this.whirliePool.physicsBodyType = Phaser.Physics.ARCADE;
    this.whirliePool.createMultiple(200, 'whirlie');
    this.whirliePool.setAll('anchor.x', 0.5);
    this.whirliePool.setAll('anchor.y', 0.5);
    this.whirliePool.setAll('outOfBoundsKill', true);
    this.whirliePool.setAll('checkWorldBounds', true);
    this.whirliePool.forEach(function(whirlie) {
      whirlie.animations.add('twirl', [0, 1, 0, 1], 15, true);
    }, this);
    this.nextShotAt = 0;
    this.shotDelay = DuckbumpGame.SHOT_DELAY;
    this.whirliesLeft = 10;
    this.whirliesText = this.add.text(
      30, 30, '' + this.whirliesLeft, {
        font: '20px pixalFont',
        fill: '#7D4513',
        align: 'center'
      }
    );
    this.whirliesText.anchor.setTo(0.5, 0.5);
  },

  setupExplosions: function() {
    this.explosionPool = this.add.group();
    this.explosionPool.enableBody = true;
    this.explosionPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.explosionPool.createMultiple(100, 'explosion');
    this.explosionPool.setAll('anchor.x', 0.5);
    this.explosionPool.setAll('anchor.y', 0.5);
    this.explosionPool.setAll('scale.x', 2);
    this.explosionPool.setAll('scale.y', 2);
    this.explosionPool.forEach(function(explosion) {
      explosion.animations.add('boom');
    });
  },

  setupPlayerIcons: function() {
    this.lives = this.add.group();
    // calculate location of first life icon
    var firstLifeIconX = this.game.width - 10 - (DuckbumpGame.PLAYER_EXTRA_LIVES * 20);
    for (var i = 0; i < DuckbumpGame.PLAYER_EXTRA_LIVES; i++) {
      var life = this.lives.create(firstLifeIconX + (20 * i), 20, 'player');
      life.scale.setTo(0.4, 0.4);
      life.anchor.setTo(0.5, 0.5);
    }
  },

  setupText: function() {
    this.instructions = this.add.text(this.game.width / 2, this.game.height - 150,
      'Use Arrow Keys to Move, Press SPACE to Fire\n' +
      'Tapping/clicking does both', {
        font: '20px pixalFont',
        fill: '#fff',
        align: 'center'
      }
    );
    this.instructions.anchor.setTo(0.5, 0.5);
    this.instExpire = this.time.now; //DuckbumpGame.INSTRUCTION_EXPIRE;
    this.score = 0;
    this.scoreText = this.add.text(
      this.game.width / 2, 30, '' + this.score, {
        font: '20px pixalFont',
        fill: '#7D4513',
        align: 'center'
      }
    );
    this.scoreText.anchor.setTo(0.5, 0.5);

  },

  update: function() {
    this.checkCollisions();
    this.spawnEnemies();
    this.processPlayerInput();
    this.processDelayedEffects();
  },

  checkCollisions: function() {
    this.physics.arcade.overlap(this.whirliePool, this.dreenDuckPool, this.duckHit, null, this);
  },

  spawnEnemies: function() {
    if (this.nextDuckAt < this.time.now && this.dreenDuckPool.countDead() > 0) {
      this.nextDuckAt = this.time.now + this.duckDelay;
      var duck = this.dreenDuckPool.getFirstExists(false);
      var px = this.rnd.integerInRange(0, 1) * this.game.width;
      var py = this.rnd.integerInRange(30, this.game.height / 3 + 30);
      duck.reset(px, py, 0, DuckbumpGame.ENEMY_HEALTH);
      var scale = Math.abs(duck.scale.x);
      duck.scale.x = (px > 0? -1 : 1) * scale;
      var velocity = this.rnd.integerInRange(DuckbumpGame.ENEMY_MAX_X_VELOCITY, DuckbumpGame.ENEMY_MIN_X_VELOCITY);
      duck.body.velocity.x = (px > 0? -1: 1) * velocity;
      duck.play('fly');
    }
  },

  processPlayerInput: function() {
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;

    if (this.cursors.left.isDown || this.input.keyboard.isDown(Phaser.Keyboard.A)) {
      this.player.body.velocity.x = -this.player.speed;
    } else if (this.cursors.right.isDown || this.input.keyboard.isDown(Phaser.Keyboard.D)) {
      this.player.body.velocity.x = this.player.speed;
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.Z) ||
      this.cursors.up.isDown ||
      this.input.keyboard.isDown(Phaser.Keyboard.W) ||
      this.input.activePointer.isDown) {
      this.fire();
    }
  },

  processDelayedEffects: function() {
    if (this.instructions.exists && this.time.now > this.instExpire) {
      this.instructions.destroy();
    }
  },

  duckHit: function(whirlie, duck) {
    duck.kill();

    if (this.cookedDuckPool.countDead() === 0 || this.explosionPool.countDead() === 0) {
      return;
    }

    var explosion = this.explosionPool.getFirstExists(false);
    var cookedDuck = this.cookedDuckPool.getFirstExists(false);
    explosion.reset(duck.x, duck.y);
    cookedDuck.reset(duck.x, duck.y);

    var px = duck.x + (duck.scale.x < 0? -1 : 1) * (this.game.height - duck.y)/4;
    var py = this.game.height - this.rnd.integerInRange(0, 30) - 15;

    this.add.tween(cookedDuck).to( { x: px, y: py }, 2000, Phaser.Easing.Bounce.Out, true);
    this.add.tween(explosion).to( { x: px, y:  py }, 2000, Phaser.Easing.Bounce.Out, true);

    explosion.play('boom', 15, false, true);

    this.addToScore(duck.reward);
    this.addToWhirliesLeft(2);
  },

  addToScore: function(score) {
    this.score += score;
    this.scoreText.text = this.score;
  },

  addToWhirliesLeft: function(amount) {
    this.whirliesLeft += amount;
    if (this.whirliesLeft < 0) {
      this.whirliesLeft = 0;
    }
    this.whirliesText.text = this.whirliesLeft;
  },

  fire: function() {
    if (!this.player.alive ||
      this.nextShotAt > this.time.now ||
      this.whirliesLeft <= 0 ||
      this.whirliePool.countDead() === 0) {
      return;
    }

    // for (var i = 0; i < 5; i++) {
    //   var bullet = this.whirliePool.getFirstExists(false);
    //   // spawn left bullet slightly left off center
    //   bullet.reset(this.player.x - (10 + i * 6), this.player.y - 20);
    //   // the left bullets spread from -95 degrees to -135 degrees
    //   this.physics.arcade.velocityFromAngle(-95 - i * 10, DuckbumpGame.BULLET_VELOCITY, bullet.body.velocity);

    //   bullet = this.whirliePool.getFirstExists(false);
    //   // spawn right bullet slightly right off center
    //   bullet.reset(this.player.x + (10 + i * 6), this.player.y - 20);
    //   // the right bullets spread from -85 degrees to -45
    //   this.physics.arcade.velocityFromAngle(-85 + i * 10, DuckbumpGame.BULLET_VELOCITY, bullet.body.velocity);

    //   bullet.play('twirl');
    // }
    var whirlie = this.whirliePool.getFirstExists(false);
    this.nextShotAt = this.time.now + this.shotDelay;
    whirlie.reset(this.player.x, this.player.y - 20);
    whirlie.body.velocity.y = -DuckbumpGame.BULLET_VELOCITY;
    whirlie.play('twirl');
    this.addToWhirliesLeft(-1);
  },

  quitGame: function(pointer) {

    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

    //  Then let's go back to the main menu.
    this.state.start('MainMenu');

  }

};