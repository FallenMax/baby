import { createEventEmitter } from '../../common/util/event'

const getTime = () => new Date().getTime() / 1000

export type SpringOption = {
  value?: number
  velocity?: number
  target?: number
  mass?: number
  tension?: number
  friction?: number
}
export type SpringEvent = {
  change: number
  settle: number
}

export const createSpring = ({
  value = 0,
  velocity = 0,
  target = 0,
  mass = 1,
  tension = 170,
  friction = 26,
}: SpringOption) => {
  let lastT = getTime()
  let timer: number
  const isSettled = () => Math.abs(value - target) < 2 && Math.abs(velocity) < 3

  const loop = () => {
    const t = getTime()
    if (isSettled()) {
      value = target
      velocity = 0
      spring.emit('settle', target)
    } else {
      const pullF = (target - value) * tension
      const frictionF = -velocity * mass * friction
      const acceleration = (pullF + frictionF) / mass
      const dt = t - lastT
      value += velocity * dt
      velocity += acceleration * dt

      spring.emit('change', value)
      next()
    }
  }

  const next = () => {
    lastT = getTime()
    cancelAnimationFrame(timer)
    timer = requestAnimationFrame(loop)
  }

  const spring = {
    ...createEventEmitter<SpringEvent>(),
    get() {
      return value
    },
    setTarget(t: number) {
      target = t
      if (!isSettled()) {
        next()
      }
    },
    setVelocity(val: number) {
      velocity = val
      if (!isSettled()) {
        next()
      }
    },
    setValue(val: number) {
      value = val
      if (!isSettled()) {
        next()
      }
    },
    destroy() {
      spring.removeAllListeners()
    },
  }

  return spring
}

export type Spring = ReturnType<typeof createSpring>
