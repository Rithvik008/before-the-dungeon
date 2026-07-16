import Phaser from 'phaser'
import type { Alignment } from '../../types'

const W = 240
const H = 360

const COIN        = 0xffd37a
const TINT_GOOD   = 0x4f7f52
const TINT_NEUTRAL = 0x9098b8
const TINT_BAD    = 0xb84a4a

export class ShopScene extends Phaser.Scene {
  private portraitBg!: Phaser.GameObjects.Rectangle
  private portraitImg!: Phaser.GameObjects.Image
  private usingSprite = false
  private portraitTween: Phaser.Tweens.Tween | null = null
  private floatTween: Phaser.Tweens.Tween | null = null
  private readonly portraitScale = 3 // must be an integer or pixel-art borders scale unevenly

  constructor() {
    super({ key: 'ShopScene' })
  }

  preload() {
    this.load.image('shop-bg', 'assets/shop-bg.png')
    this.load.image('goblin-adventurer', 'assets/portraits/goblin.png')
    this.load.image('good-male-apprentice', 'assets/portraits/good_male_apprentice.png')
    this.load.image('young-prince', 'assets/portraits/male_young_prince.png')
    this.load.image('shadow-goblin', 'assets/portraits/blue_evil_goblin.png')
  }

  create() {
    this.add.image(W / 2, H / 2, 'shop-bg').setDisplaySize(W, H)

    // Portrait sits roughly a third of the way down — no backing card, just the character
    const frameX = W * 0.42
    const frameY = H * 0.34

    // Colored rectangle fallback (used until a customer has real sprite art)
    this.portraitBg = this.add.rectangle(frameX, frameY, 120, 144, TINT_NEUTRAL)
    this.portraitBg.setAlpha(0)

    // Sprite layer
    this.portraitImg = this.add.image(frameX, frameY, 'goblin-adventurer')
    this.portraitImg.setScale(this.portraitScale)
    this.portraitImg.setAlpha(0)

    // Float tween
    this.floatTween = this.tweens.add({
      targets: [this.portraitBg, this.portraitImg],
      y: '+=4',
      yoyo: true,
      repeat: -1,
      duration: 1400,
      ease: 'Sine.easeInOut',
    })

    this.game.events.emit('scene:ready')
  }

  showCustomer(alignment: Alignment, tint: number, portraitKey?: string) {
    this.portraitTween?.stop()

    const hasSprite = !!portraitKey && this.textures.exists(portraitKey)
    this.usingSprite = hasSprite

    if (hasSprite) {
      this.portraitImg.setTexture(portraitKey!)
      this.portraitBg.setAlpha(0)
      this.portraitImg.setAlpha(0)
      this.portraitTween = this.tweens.add({
        targets: this.portraitImg,
        alpha: 1, duration: 500, ease: 'Sine.easeOut',
      })
    } else {
      const bodyColor = tint || (alignment === 'good' ? TINT_GOOD : alignment === 'bad' ? TINT_BAD : TINT_NEUTRAL)
      this.portraitBg.setFillStyle(bodyColor)
      this.portraitBg.setAlpha(0)
      this.portraitImg.setAlpha(0)
      this.portraitTween = this.tweens.add({
        targets: this.portraitBg,
        alpha: 1, duration: 500, ease: 'Sine.easeOut',
      })
    }
  }

  hideCustomer() {
    this.portraitTween?.stop()
    this.portraitTween = this.tweens.add({
      targets: [this.portraitBg, this.portraitImg],
      alpha: 0, duration: 400, ease: 'Sine.easeIn',
    })
  }

  private get activePortrait(): Phaser.GameObjects.GameObject {
    return this.usingSprite ? this.portraitImg : this.portraitBg
  }

  playHappy() {
    this.tweens.add({
      targets: this.activePortrait,
      y: '-=6', yoyo: true, duration: 130, ease: 'Power2', repeat: 2,
    })
  }

  playAngry() {
    this.cameras.main.shake(300, 0.004)
    this.tweens.add({
      targets: this.activePortrait,
      x: '+=4', yoyo: true, repeat: 4, duration: 60, ease: 'Linear',
    })
  }

  spawnCoin() {
    const coin = this.add.rectangle(W * 0.42, H * 0.34, 9, 9, COIN)
    this.tweens.add({
      targets: coin,
      y: H * 0.08, x: W - 30, alpha: 0,
      duration: 650, ease: 'Power2',
      onComplete: () => coin.destroy(),
    })
  }
}
