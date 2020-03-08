/** paths here are source-of-truth, to be used/cross-checked all over the app */
export const paths = {
  '/': '/',
  '/register': '/register',
  '/home': '/home',
  '/profile': '/profile',
  '/eat': '/eat',
  '/eat/:guid': '/eat/:guid',
  '/sleep': '/sleep',
  '/sleep/:guid': '/sleep/:guid',
  '/pisspoop': '/pisspoop',
  '/pisspoop/:guid': '/pisspoop/:guid',
  '/statistics': '/statistics',
}

export type PathMapping = typeof paths
export type Path = keyof PathMapping
