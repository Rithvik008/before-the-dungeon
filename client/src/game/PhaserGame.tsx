import Phaser from 'phaser'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { ShopScene } from './scenes/ShopScene'
import type { Alignment } from '../types'

export interface PhaserGameHandle {
  showCustomer: (alignment: Alignment, tint: number, portraitKey?: string) => void
  hideCustomer: () => void
  playHappy: () => void
  playAngry: () => void
  spawnCoin: () => void
}

type PendingShow = { alignment: Alignment; tint: number; portraitKey?: string }

export const PhaserGame = forwardRef<PhaserGameHandle>((_, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const sceneRef = useRef<ShopScene | null>(null)
  const pendingShowRef = useRef<PendingShow | null>(null)

  useImperativeHandle(ref, () => ({
    showCustomer: (alignment, tint, portraitKey) => {
      if (sceneRef.current) {
        sceneRef.current.showCustomer(alignment, tint, portraitKey)
      } else {
        // Scene not ready yet — queue it so it fires as soon as create() finishes
        pendingShowRef.current = { alignment, tint, portraitKey }
      }
    },
    hideCustomer: () => sceneRef.current?.hideCustomer(),
    playHappy:    () => sceneRef.current?.playHappy(),
    playAngry:    () => sceneRef.current?.playAngry(),
    spawnCoin:    () => sceneRef.current?.spawnCoin(),
  }))

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    const shopScene = new ShopScene()

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 240,
      height: 360,
      backgroundColor: '#10131c',
      parent: containerRef.current,
      pixelArt: true,
      roundPixels: false,
      scene: shopScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: { antialias: false },
    })

    game.events.once('scene:ready', () => {
      sceneRef.current = shopScene
      if (pendingShowRef.current) {
        const { alignment, tint, portraitKey } = pendingShowRef.current
        shopScene.showCustomer(alignment, tint, portraitKey)
        pendingShowRef.current = null
      }
    })

    gameRef.current = game

    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
      sceneRef.current = null
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    />
  )
})

PhaserGame.displayName = 'PhaserGame'
