import { createEventEmitter } from '../../common/util/event'

type Vector = {
  x: number
  y: number
}

type DragStatus =
  | { type: 'idle' }
  | {
      type: 'dragging'
      start: Vector
      last: Vector
      lastTime: number
      current: Vector
      currentTime: number
    }

const getTime = () => new Date().getTime() / 1000
const getOffset = (v1: Vector, v2: Vector): Vector => {
  return {
    x: v2.x - v1.x,
    y: v2.y - v1.y,
  }
}

const touchToPoint = (t: Touch): Vector => {
  return { x: t.screenX, y: t.screenY }
}

export type DragOptions = {
  direction?: 'all' | 'vertical' | 'horizonal'
}
export type DragEvents = {
  dragStart: undefined
  drag: {
    offset: Vector
    velocity: Vector
  }
  dragEnd: {
    offset: Vector
    velocity: Vector
  }
}
export const createDragger = (el: HTMLElement) => {
  let status: DragStatus = { type: 'idle' }

  const setStatus = (s: DragStatus) => {
    status = s
  }

  const onStart = (e: TouchEvent) => {
    const target = e.target as HTMLElement
    if (target.scrollHeight - target.offsetHeight > 1) {
      return
    }

    switch (status.type) {
      case 'idle': {
        setStatus({
          type: 'dragging',
          start: touchToPoint(e.touches[0]),
          last: touchToPoint(e.touches[0]),
          lastTime: getTime(),
          current: touchToPoint(e.touches[0]),
          currentTime: getTime(),
        })
        dragger.emit('dragStart')
        break
      }
    }
  }
  const onMove = (e: TouchEvent) => {
    switch (status.type) {
      case 'dragging': {
        setStatus({
          type: 'dragging',
          start: status.start,
          last: status.current,
          lastTime: status.currentTime,
          current: touchToPoint(e.touches[0]),
          currentTime: getTime(),
        })
        const offset = getOffset(status.start, status.current)
        const delta = getOffset(status.last, status.current)
        const dt = status.currentTime - status.lastTime
        dragger.emit('drag', {
          offset,
          velocity: {
            x: delta.x / (dt || 1),
            y: delta.y / (dt || 1),
          },
        })
        break
      }
    }
  }
  const onEnd = (e: TouchEvent) => {
    switch (status.type) {
      case 'dragging': {
        const offset = getOffset(status.start, status.current)
        const delta = getOffset(status.last, status.current)
        const dt = getTime() - status.lastTime
        setStatus({
          type: 'idle',
        })
        dragger.emit('dragEnd', {
          offset,
          velocity: {
            x: delta.x / (dt || 1),
            y: delta.y / (dt || 1),
          },
        })
        break
      }
    }
  }

  el.addEventListener('touchstart', onStart)
  el.addEventListener('touchmove', onMove)
  el.addEventListener('touchend', onEnd)

  const dragger = {
    ...createEventEmitter<DragEvents>(),
    destroy() {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      dragger.removeAllListeners()
    },
  }
  return dragger
}

export type Dragger = ReturnType<typeof createDragger>
