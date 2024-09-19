
import { ClickAwayListener } from '@mui/material'
import React, { useEffect, useState } from 'react'

import { UUIDComponent } from '@xrengine/ecs'
import { getComponent } from '@xrengine/ecs/src/ComponentFunctions'
import { AudioEffectPlayer } from '@xrengine/engine/src/audio/systems/MediaSystem'
import { emoteAnimations, preloadedAnimations } from '@xrengine/engine/src/avatar/animation/Util'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { AvatarNetworkAction } from '@xrengine/engine/src/avatar/state/AvatarNetworkActions'
import { dispatchAction } from '@xrengine/hyperflux'
import Button from '@xrengine/ui/src/primitives/mui/Button'
import Icon from '@xrengine/ui/src/primitives/mui/Icon'

import { PopupMenuServices } from '../PopupMenuService'
import styles from './EmoteMenu.module.scss'

const MAX_EMOTE_PER_PAGE = 6
const MIN_EMOTE_PER_PAGE = 5
const getEmotePerPage = () => (window.innerWidth > 768 ? MAX_EMOTE_PER_PAGE : MIN_EMOTE_PER_PAGE)

export const useEmoteMenuHooks = () => {
  const [page, setPage] = useState(0)
  const [imgPerPage, setImgPerPage] = useState(getEmotePerPage())

  let [menuRadius, setMenuRadius] = useState(window.innerWidth > 360 ? 182 : 150)

  let menuPadding = window.innerWidth > 360 ? 25 : 20
  let menuThickness = menuRadius > 170 ? 70 : 60
  let menuItemWidth = menuThickness - menuPadding
  let menuItemRadius = menuItemWidth / 2
  let effectiveRadius = menuRadius - menuItemRadius - menuPadding / 2

  let [items, setItems] = useState([
    {
      body: (
        <img
          style={{
            height: 'auto',
            maxWidth: '100%'
          }}
          src="/static/Wave.svg"
          alt="Wave"
        />
      ),
      containerProps: {
        onClick: () => playAnimation(emoteAnimations.wave)
      }
    },
    {
      body: (
        <img
          style={{
            height: 'auto',
            maxWidth: '100%'
          }}
          src="/static/clap1.svg"
          alt="Clap"
        />
      ),
      containerProps: {
        onClick: () => playAnimation(emoteAnimations.clap)
      }
    },
    {
      body: (
        <img
          style={{
            height: 'auto',
            maxWidth: '100%'
          }}
          src="/static/Dance1.svg"
          alt="Dance 1"
        />
      ),
      containerProps: {
        onClick: () => playAnimation(emoteAnimations.dance1)
      }
    },
    {
      body: (
        <img
          style={{
            height: 'auto',
            maxWidth: '100%'
          }}
          src="/static/Dance2.svg"
          alt="Dance 2"
        />
      ),
      containerProps: {
        onClick: () => playAnimation(emoteAnimations.dance2)
      }
    },
    {
      body: (
        <img
          style={{
            height: 'auto',
            maxWidth: '100%'
          }}
          src="/static/Dance3.svg"
          alt="Dance 3"
        />
      ),
      containerProps: {
        onClick: () => playAnimation(emoteAnimations.dance3)
      }
    },
    {
      body: (
        <img
          style={{
            height: 'auto',
            maxWidth: '100%'
          }}
          src="/static/Dance4.svg"
          alt="Dance 4"
        />
      ),
      containerProps: {
        onClick: () => playAnimation(emoteAnimations.dance4)
      }
    },
    {
      body: (
        <img
          style={{
            height: 'auto',
            maxWidth: '100%'
          }}
          src="/static/Kiss.svg"
          alt="Kiss"
        />
      ),
      containerProps: {
        onClick: () => playAnimation(emoteAnimations.kiss)
      }
    },
    {
      body: (
        <img
          style={{
            height: 'auto',
            maxWidth: '100%'
          }}
          src="/static/Cry.svg"
          alt="Cry"
        />
      ),
      containerProps: {
        onClick: () => playAnimation(emoteAnimations.cry)
      }
    },
    {
      body: (
        <img
          style={{
            height: 'auto',
            maxWidth: '100%'
          }}
          src="/static/Laugh.svg"
          alt="Laugh"
        />
      ),
      containerProps: {
        onClick: () => playAnimation(emoteAnimations.laugh)
      }
    },
    {
      body: (
        <img
          style={{
            height: 'auto',
            maxWidth: '100%'
          }}
          src="/static/Defeat.svg"
          alt="Defeat"
        />
      ),
      containerProps: {
        onClick: () => playAnimation(emoteAnimations.defeat)
      }
    }
  ])

  const calculateMenuRadius = () => {
    setImgPerPage(getEmotePerPage())
    setMenuRadius(window.innerWidth > 360 ? 182 : 150)
    calculateOtherValues()
  }

  useEffect(() => {
    window.addEventListener('resize', calculateMenuRadius)
    calculateOtherValues()
  }, [])

  const closeMenu = (e) => {
    e.preventDefault()
    PopupMenuServices.showPopupMenu()
  }

  const calculateOtherValues = (): void => {
    menuThickness = menuRadius > 170 ? 70 : 60
    menuItemWidth = menuThickness - menuPadding
    menuItemRadius = menuItemWidth / 2
    effectiveRadius = menuRadius - menuItemRadius - menuPadding / 2
  }

  const playAnimation = (stateName: string) => {
    const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
    dispatchAction(
      AvatarNetworkAction.setAnimationState({
        animationAsset: preloadedAnimations.emotes,
        clipName: stateName,
        loop: false,
        layer: 0,
        entityUUID: getComponent(selfAvatarEntity, UUIDComponent)
      })
    )
    // close Menu after playing animation
    PopupMenuServices.showPopupMenu()
  }

  const renderEmoteList = () => {
    const itemList = [] as JSX.Element[]
    const startIndex = page * imgPerPage
    const endIndex = Math.min(startIndex + imgPerPage, items.length)
    let angle = 360 / imgPerPage
    let index = 0
    let itemAngle = 0
    let x = 0
    let y = 0

    for (let i = startIndex; i < endIndex; i++, index++) {
      const emoticon = items[i]
      itemAngle = angle * index + 270
      x = effectiveRadius * Math.cos((itemAngle * Math.PI) / 280)
      y = effectiveRadius * Math.sin((itemAngle * Math.PI) / 280)

      itemList.push(
        <div key={i}>
          <Button
            className={styles.menuItem}
            {...emoticon.containerProps}
            onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            style={{
              width: menuItemWidth,
              height: menuItemWidth,
              transform: `translate(${x}px , ${y}px)`
            }}
          >
            {emoticon.body}
          </Button>
        </div>
      )
    }

    return itemList
  }

  const loadNextEmotes = (e) => {
    e.preventDefault()
    if ((page + 1) * imgPerPage >= items.length) return
    setPage(page + 1)
  }
  const loadPreviousEmotes = (e) => {
    e.preventDefault()
    if (page === 0) return
    setPage(page - 1)
  }

  return {
    closeMenu,
    menuRadius,
    menuThickness,
    loadPreviousEmotes,
    menuItemRadius,
    renderEmoteList,
    page,
    imgPerPage,
    items,
    loadNextEmotes
  }
}

const EmoteMenu = (): JSX.Element => {
  const {
    closeMenu,
    menuRadius,
    menuThickness,
    loadPreviousEmotes,
    menuItemRadius,
    renderEmoteList,
    page,
    imgPerPage,
    items,
    loadNextEmotes
  } = useEmoteMenuHooks()

  return (
    <section className={styles.emoteMenu}>
      <ClickAwayListener onClickAway={closeMenu} mouseEvent="onMouseDown">
        <div
          className={styles.itemContainer}
          style={{
            width: menuRadius * 2,
            height: menuRadius * 2,
            borderWidth: menuThickness
          }}
        >
          <div className={styles.itemContainerPrev}>
            <button
              type="button"
              className={`${styles.iconBlock} ${page === 0 ? styles.disabled : ''}`}
              onClick={loadPreviousEmotes}
              onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            >
              <Icon type="NavigateBefore" />
            </button>
          </div>
          <div
            className={styles.menuItemBlock}
            style={{
              width: menuItemRadius,
              height: menuItemRadius
            }}
          >
            {renderEmoteList()}
          </div>
          <div className={styles.itemContainerNext}>
            <button
              type="button"
              className={`${styles.iconBlock} ${(page + 1) * imgPerPage >= items.length ? styles.disabled : ''}`}
              onClick={loadNextEmotes}
              onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
              onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
            >
              <Icon type="NavigateNext" />
            </button>
          </div>
        </div>
      </ClickAwayListener>
    </section>
  )
}

export default EmoteMenu
