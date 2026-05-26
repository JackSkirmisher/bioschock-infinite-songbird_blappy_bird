// Variables Globales
let bird;
let cursors;
let hasLanded = false;
let hasBumped = false;
let isGameStarted = false;
let messageToPlayer;
let background;
let road; 
let topColumns;    
let bottomColumns;
let bgMusic;

let config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 600 },
      debug: true, 
    },
  },
  scale: {
    mode: Phaser.Scale.FIT, 
    autoCenter: Phaser.Scale.CENTER_BOTH, 
    backgroundColor: '#000000'
  },
  render: {
    pixelArt: true,
    antialias: false
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

let game = new Phaser.Game(config);

function preload() {
  this.load.image("background", "Sprites_FlappyBird/Columbia.png");
  this.load.image("road", "Sprites_FlappyBird/Bridge.png");
  this.load.image("column", "Sprites_FlappyBird/Pillar.png");
  
  this.load.audio("theme", "Audio_FlappyBird/AirBach.mp3");

  this.load.spritesheet("bird", "Sprites_FlappyBird/SongBird.png", {
    frameWidth: 32,
    frameHeight: 32,
  });
}

function create() {
  // 1. Teclado
  cursors = this.input.keyboard.createCursorKeys();

  // 2. Fondo de Columbia
  background = this.add.image(0, 0, "background").setOrigin(0, 0);
  background.displayWidth = this.sys.game.config.width;
  background.displayHeight = this.sys.game.config.height;

  bgMusic = this.sound.add("theme", {
    volume: 0.5, 
    loop: true   
  });
  bgMusic.play();

  // 3. Grupos de Columnas Físicas Dinámicas
  topColumns = this.physics.add.group();
  bottomColumns = this.physics.add.group();

  // Obstáculos iniciales con alturas aleatorias
  for (let i = 0; i < 50; i++) {
    let xSpawn = 550 + (i * 350);
    
    let randomY = Phaser.Math.Between(-90, 90);
    
    let topCol = topColumns.create(xSpawn, -120 + randomY, "column");
    topCol.setScale(2);
    topCol.setFlipY(true);
    topCol.body.allowGravity = false; 
    topCol.body.immovable = true;
    topCol.setBodySize(35, 300, true);

    let bottomCol = bottomColumns.create(xSpawn + 50, 680 + randomY, "column");
    bottomCol.setScale(2);
    bottomCol.body.allowGravity = false;
    bottomCol.body.immovable = true;
    bottomCol.setBodySize(35, 300, true);
    
    topCol.columnNumber = i; 
  }

  // 4. El Puente / Suelo
  road = this.add.tileSprite(0, 500, 400, 50, "road").setOrigin(0, 0).setScale(2);
  this.physics.add.existing(road, true);

  // 5. EL Songbird
  bird = this.physics.add.sprite(150, 250, "bird").setScale(3);
  bird.setBounce(0.2);
  bird.setCollideWorldBounds(true);
  bird.setBodySize(15, 15, true);

  // Animación del Songbird
  this.anims.create({
    key: 'fly',
    frames: this.anims.generateFrameNumbers('bird', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  bird.anims.play('fly', true);

  // 6. Texto en pantalla
  messageToPlayer = this.add.text(0, 0, "Instructions: Press space bar to start", {
    fontFamily: 'Pixeled, sans-serif',
    fontSize: "10px",
    color: "black",
    padding: { x: 10, y: 5 }
  });
  Phaser.Display.Align.In.BottomCenter(messageToPlayer, background, 0, -50);

  // 7. Colisiones y Overlaps
  this.physics.add.overlap(bird, road, () => (hasLanded = true), null, this);
  this.physics.add.collider(bird, road);

  this.physics.add.overlap(bird, topColumns, () => (hasBumped = true), null, this);
  this.physics.add.overlap(bird, bottomColumns, () => (hasBumped = true), null, this);
  this.physics.add.collider(bird, topColumns);
  this.physics.add.collider(bird, bottomColumns);
}

function update() {
  if (!isGameStarted) {
    bird.setVelocityY(0);
    if (cursors.space.isDown) {
      isGameStarted = true;
      messageToPlayer.text = 'Instructions: Press the "^" button to fly\nAnd don\'t hit the columns or ground';
    }
    return;
  }

  if (!hasLanded && !hasBumped) {
    if (cursors.up.isDown) {
      bird.setVelocityY(-230);
    }

    road.tilePositionX += 2; 

    topColumns.setVelocityX(-120);
    bottomColumns.setVelocityX(-120);
    
    bird.anims.play('fly', true);
  } else {
    topColumns.setVelocityX(0);
    bottomColumns.setVelocityX(0);
    bird.setVelocityX(0);
    bird.anims.stop();

    // Detiene la pista limpia al chocar
    if (bgMusic && bgMusic.isPlaying) {
      bgMusic.stop();
    }

    messageToPlayer.text = `You crashed`;
  }

  topColumns.children.iterate((child) => {
    if (child && child.columnNumber === 49 && child.x < 100) {
       topColumns.setVelocityX(0);
       bottomColumns.setVelocityX(0);
       messageToPlayer.text = `You are free now`;
    }
  });
}

// **** Infografía:
// - Tutorial de Codedex: Build a Flappy Bird Clone with Phaser (https://www.codedex.io/projects/build-a-flappy-bird-clone-with-phaser)
// - Asesoría de IA: Google Gemini y Copilot Chat
// - Música: Bioschock Infinite Soundtrack - Air on the G String (1723) by J.S. Bach, A. Verzhbilovich, A. Wilhelmj (https://www.youtube.com/watch?v=omiBoGp3pWw)
