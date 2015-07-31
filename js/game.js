DuckbumpGame.Game = function (game) {

};

DuckbumpGame.Game.prototype = {
  preload: function () {
    this.load.image('sea', 'assets/sea.png');
    // this.load.image('bullet', 'assets/bullet.png');
    this.load.spritesheet('bullet', 'img/whirlie_sprite.png', 14, 24);

    this.load.spritesheet('greenEnemy', 'img/green_sprite.png', 48, 24, 2);
    this.load.spritesheet('explosion', 'assets/explosion.png', 32, 32);
    // this.load.spritesheet('player', 'assets/player.png', 64, 64);
    this.load.image('player', 'img/DuckBumpJones.png')
  },

  create: function () {
    this.setupBackground();
    this.setupPlayer();
    this.setupEnemies();
    this.setupBullets();
    this.setupExplosions();
    this.setupText();
    this.setupPlayerIcons();
    this.cursors = this.input.keyboard.createCursorKeys();
  },

  setupBackground: function () {
    this.sea = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'sea');
    this.sea.autoScroll(-DuckbumpGame.SEA_SCROLL_SPEED, 0);
  },

  setupPlayer: function () {
    this.player = this.add.sprite(this.game.width / 2, this.game.height - 50, 'player');
    this.player.anchor.setTo(0.5, 0.5);
    // this.player.animations.add('fly', [0, 1, 2], 20, true);
    // this.player.animations.add('ghost', [3, 0, 3, 1], 20, true);
    // this.player.play('fly');
    this.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.body.collideWorldBounds = true;
    this.player.speed = DuckbumpGame.PLAYER_SPEED;
    this.player.body.setSize(20, 20, 0, -5);
  },

  setupEnemies: function () {
    this.enemyPool = this.add.group();
    this.enemyPool.enableBody = true;
    this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemyPool.createMultiple(50, 'greenEnemy');
    this.enemyPool.setAll('anchor.x', 0.5);
    this.enemyPool.setAll('anchor.y', 0.5);
    this.enemyPool.setAll('outOfBoundsKill', true);
    this.enemyPool.setAll('checkWorldBounds', true);
    this.enemyPool.setAll('reward', DuckbumpGame.ENEMY_REWARD, false, false, 0, true);
    this.enemyPool.forEach(function (enemy) {
      enemy.animations.add('fly', [0, 1, 0, 1], 20, true);
      enemy.animations.add('hit', [0, 1, 0, 1], 20, false);
      enemy.events.onAnimationComplete.add(function (e) {
        e.play('fly');
      }, this);
    });

    this.nextEnemyAt = 0;
    this.enemyDelay = DuckbumpGame.SPAWN_ENEMY_DELAY;

  },

  setupBullets: function () {
    this.bulletPool = this.add.group();
    this.bulletPool.enableBody = true;
    this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.bulletPool.createMultiple(200, 'bullet');
    this.bulletPool.setAll('anchor.x', 0.5);
    this.bulletPool.setAll('anchor.y', 0.5);
    this.bulletPool.setAll('outOfBoundsKill', true);
    this.bulletPool.setAll('checkWorldBounds', true);
    this.bulletPool.forEach(function (bullet) {
      bullet.animations.add('twirl', [0, 1, 0, 1], 15, true);
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
    var firstLifeIconX = this.game.width - 10 - (DuckbumpGame.PLAYER_EXTRA_LIVES * 30);
    for (var i = 0; i < DuckbumpGame.PLAYER_EXTRA_LIVES; i++) {
      var life = this.lives.create(firstLifeIconX + (30 * i), 30, 'player');
      life.scale.setTo(0.5, 0.5);
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
    this.instExpire = this.time.now + DuckbumpGame.INSTRUCTION_EXPIRE;
    this.score = 0;
    this.scoreText = this.add.text(
      this.game.width / 2, 30, '' + this.score, {
        font: '20px pixalFont',
        fill: '#fff',
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
      this.bulletPool, this.enemyPool, this.enemyHit, null, this
    );
    this.physics.arcade.overlap(
      this.player, this.enemyPool, this.playerHit, null, this
    );
  },

  spawnEnemies: function () {
    if (this.nextEnemyAt < this.time.now && this.enemyPool.countDead() > 0) {
      this.nextEnemyAt = this.time.now + this.enemyDelay;
      var enemy = this.enemyPool.getFirstExists(false);
      enemy.reset(0, this.rnd.integerInRange(0, this.game.height / 3), 0, DuckbumpGame.ENEMY_HEALTH);
      enemy.body.velocity.x = this.rnd.integerInRange(DuckbumpGame.ENEMY_MAX_X_VELOCITY, DuckbumpGame.ENEMY_MIN_X_VELOCITY);
      enemy.play('fly');
    }
  },

  processPlayerInput: function () {
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;

    if (this.cursors.left.isDown) {
      this.player.body.velocity.x = -this.player.speed;
    } else if (this.cursors.right.isDown) {
      this.player.body.velocity.x = this.player.speed;
    }

    if (this.cursors.up.isDown) {
      this.player.body.velocity.y = -this.player.speed;
    } else if (this.cursors.down.isDown) {
      this.player.body.velocity.y = this.player.speed;
    }

    if (this.input.activePointer.isDown &&
      this.physics.arcade.distanceToPointer(this.player) > 15) {
      this.physics.arcade.moveToPointer(this.player, this.player.speed);
    }

    if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) ||
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

  enemyHit: function (bullet, enemy) {
    bullet.kill();
    this.damageEnemy(enemy, DuckbumpGame.BULLET_DAMAGE);
  },

  playerHit: function (player, enemy) {
    if (this.ghostUntil && this.ghostUntil > this.time.now) {
      return;
    }
    this.damageEnemy(enemy, DuckbumpGame.CRASH_DAMAGE);
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

  damageEnemy: function (enemy, damage) {
    enemy.damage(damage);
    if (enemy.alive) {
      enemy.play('hit');
    } else {
      this.explode(enemy);
      this.addToScore(enemy.reward);
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

    if (this.bulletPool.countDead() === 0) {
      return;
    }
    // for (var i = 0; i < 5; i++) {
    //   var bullet = this.bulletPool.getFirstExists(false);
    //   // spawn left bullet slightly left off center
    //   bullet.reset(this.player.x - (10 + i * 6), this.player.y - 20);
    //   // the left bullets spread from -95 degrees to -135 degrees
    //   this.physics.arcade.velocityFromAngle(-95 - i * 10, DuckbumpGame.BULLET_VELOCITY, bullet.body.velocity);

    //   bullet = this.bulletPool.getFirstExists(false);
    //   // spawn right bullet slightly right off center
    //   bullet.reset(this.player.x + (10 + i * 6), this.player.y - 20);
    //   // the right bullets spread from -85 degrees to -45
    //   this.physics.arcade.velocityFromAngle(-85 + i * 10, DuckbumpGame.BULLET_VELOCITY, bullet.body.velocity);
      
    //   bullet.play('twirl');
    // }
    var bullet = this.bulletPool.getFirstExists(false);
    this.nextShotAt = this.time.now + this.shotDelay;
    bullet.reset(this.player.x, this.player.y - 20);
    bullet.body.velocity.y = -DuckbumpGame.BULLET_VELOCITY;
    bullet.play('twirl');

  },

  quitGame: function (pointer) {

    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

    //  Then let's go back to the main menu.
    this.state.start('MainMenu');

  }

};