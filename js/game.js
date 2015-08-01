DuckbumpGame.Game = function (game) {

};

DuckbumpGame.Game.prototype = {
  preload: function () {
    this.load.image('background', 'img/DuckBumpBackground.jpg');
    this.load.spritesheet('whirlie', 'img/whirlie_sprite.png', 14, 24);
    this.load.spritesheet('greenDuck', 'img/green_sprite.png', 48, 24, 2);
    // this.load.spritesheet('goldDuck', 'img/gold_sprite.png', 48, 24, 2);
    this.load.spritesheet('explosion', 'assets/explosion.png', 32, 32);
    this.load.image('player', 'img/DuckBumpJones.png')
  },

  create: function () {
    this.setupBackground();
    this.setupPlayer();
    this.setupDucks();
    this.setupWhirlies();
    this.setupExplosions();
    this.setupText();
    this.setupPlayerIcons();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.shootKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.shootKey.onDown.add(this.fire, this);
  },

  setupBackground: function () {
    this.background = this.add.sprite(0, 0, 'background');
    this.background.width = this.game.width;
    this.background.height = this.game.height;
  },

  setupPlayer: function () {
    this.player = this.add.sprite(this.game.width / 2, this.game.height - 50, 'player');
    this.player.anchor.setTo(0.5, 0.5);
    this.player.scale.setTo(.8, .8);
    // this.player.animations.add('fly', [0, 1, 2], 20, true);
    // this.player.animations.add('ghost', [3, 0, 3, 1], 20, true);
    // this.player.play('fly');
    this.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.body.collideWorldBounds = true;
    this.player.speed = DuckbumpGame.PLAYER_SPEED;
    this.player.body.setSize(20, 20, 0, -5);
  },

  setupDucks: function () {
    this.dreenDuckPool = this.add.group();
    this.dreenDuckPool.enableBody = true;
    this.dreenDuckPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.dreenDuckPool.createMultiple(50, 'greenDuck');
    this.dreenDuckPool.setAll('anchor.x', 0.5);
    this.dreenDuckPool.setAll('anchor.y', 0.5);
    this.dreenDuckPool.setAll('outOfBoundsKill', true);
    this.dreenDuckPool.setAll('checkWorldBounds', true);
    this.dreenDuckPool.setAll('reward', DuckbumpGame.ENEMY_REWARD, false, false, 0, true);
    this.dreenDuckPool.forEach(function (duck) {
      duck.animations.add('fly', [0, 1, 0, 1], 20, true);
      duck.animations.add('hit', [0, 1, 0, 1], 20, false);
      duck.events.onAnimationComplete.add(function (e) {
        e.play('fly');
      }, this);
    });

    this.nextDuckAt = 0;
    this.duckDelay = DuckbumpGame.SPAWN_ENEMY_DELAY;

  },

  setupWhirlies: function () {
    this.whirliePool = this.add.group();
    this.whirliePool.enableBody = true;
    this.whirliePool.physicsBodyType = Phaser.Physics.ARCADE;
    this.whirliePool.createMultiple(200, 'whirlie');
    this.whirliePool.setAll('anchor.x', 0.5);
    this.whirliePool.setAll('anchor.y', 0.5);
    this.whirliePool.setAll('outOfBoundsKill', true);
    this.whirliePool.setAll('checkWorldBounds', true);
    this.whirliePool.forEach(function (whirlie) {
      whirlie.animations.add('twirl', [0, 1, 0, 1], 15, true);
    }, this);
    this.nextShotAt = 0;
    this.shotDelay = DuckbumpGame.SHOT_DELAY;
  },

  setupExplosions: function () {
    this.explosionPool = this.add.group();
    this.explosionPool.enableBody = true;
    this.explosionPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.explosionPool.createMultiple(100, 'explosion');
    this.explosionPool.setAll('anchor.x', 0.5);
    this.explosionPool.setAll('anchor.y', 0.5);
    this.explosionPool.forEach(function (explosion) {
      explosion.animations.add('boom');
    });
  },

  setupPlayerIcons: function () {
    this.lives = this.add.group();
    // calculate location of first life icon
    var firstLifeIconX = this.game.width - 10 - (DuckbumpGame.PLAYER_EXTRA_LIVES * 20);
    for (var i = 0; i < DuckbumpGame.PLAYER_EXTRA_LIVES; i++) {
      var life = this.lives.create(firstLifeIconX + (20 * i), 20, 'player');
      life.scale.setTo(0.4, 0.4);
      life.anchor.setTo(0.5, 0.5);
    }
  },

  setupText: function () {
    this.instructions = this.add.text(this.game.width / 2, this.game.height - 150,
      'Use Arrow Keys to Move, Press SPACE to Fire\n' +
      'Tapping/clicking does both', {
        font: '20px pixalFont',
        fill: '#fff',
        align: 'center'
      }
      );
    this.instructions.anchor.setTo(0.5, 0.5);
    this.instExpire = this.time.now;//DuckbumpGame.INSTRUCTION_EXPIRE;
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

  update: function () {
    this.checkCollisions();
    this.spawnEnemies();
    this.processPlayerInput();
    this.processDelayedEffects();
  },

  checkCollisions: function () {
    this.physics.arcade.overlap(
      this.whirliePool, this.dreenDuckPool, this.duckHit, null, this
      );
    this.physics.arcade.overlap(
      this.player, this.dreenDuckPool, this.playerHit, null, this
      );
  },

  spawnEnemies: function () {
    if (this.nextDuckAt < this.time.now && this.dreenDuckPool.countDead() > 0) {
      this.nextDuckAt = this.time.now + this.duckDelay;
      var duck = this.dreenDuckPool.getFirstExists(false);
      duck.reset(0, this.rnd.integerInRange(0, this.game.height / 3), 0, DuckbumpGame.ENEMY_HEALTH);
      duck.body.velocity.x = this.rnd.integerInRange(DuckbumpGame.ENEMY_MAX_X_VELOCITY, DuckbumpGame.ENEMY_MIN_X_VELOCITY);
      duck.play('fly');
    }
  },

  processPlayerInput: function () {
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

processDelayedEffects: function () {
  if (this.instructions.exists && this.time.now > this.instExpire) {
    this.instructions.destroy();
  }

  if (this.ghostUntil && this.ghostUntil < this.time.now) {
    this.ghostUntil = null;
      // this.player.play('fly');
    }
  },

  render: function () {
    // this.game.debug.body(this.player);
    // this.game.debug.body(this.enemy);
  },

  duckHit: function (whirlie, duck) {
    whirlie.kill();
    this.damageDuck(duck, DuckbumpGame.BULLET_DAMAGE);
  },

  playerHit: function (player, duck) {
    if (this.ghostUntil && this.ghostUntil > this.time.now) {
      return;
    }
    this.damageDuck(duck, DuckbumpGame.CRASH_DAMAGE);
    var life = this.lives.getFirstAlive();
    if (life !== null) {
      life.kill();
      this.ghostUntil = this.time.now + DuckbumpGame.PLAYER_GHOST_TIME;
      // this.player.play('ghost');
    } else {
      this.explode(player);
      player.kill();
    }
  },

  damageDuck: function (duck, damage) {
    duck.damage(damage);
    if (duck.alive) {
      duck.play('hit');
    } else {
      this.explode(duck);
      this.addToScore(duck.reward);
    }
  },

  addToScore: function (score) {
    this.score += score;
    this.scoreText.text = this.score;
  },

  explode: function (sprite) {
    if (this.explosionPool.countDead() === 0) {
      return;
    }
    var explosion = this.explosionPool.getFirstExists(false);
    explosion.reset(sprite.x, sprite.y);
    explosion.play('boom', 15, false, true);
    // add the original sprite's velocity to the explosion
    explosion.body.velocity.x = sprite.body.velocity.x;
    explosion.body.velocity.y = sprite.body.velocity.y;
  },

  fire: function () {
    if (!this.player.alive || this.nextShotAt > this.time.now) {
      return;
    }

    if (this.whirliePool.countDead() === 0) {
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

  },

  quitGame: function (pointer) {

    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

    //  Then let's go back to the main menu.
    this.state.start('MainMenu');

  }

};