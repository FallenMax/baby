import * as fs from 'fs'
import * as mkdirp from 'mkdirp'

/**
 * manage uploaded file
 */
export const fileService = {
  isExist(path: string): boolean {
    try {
      fs.statSync(path)
      return true
    } catch (error) {
      return false
    }
  },
  ensureDirectory(path: string): void {
    const exist = fileService.isExist(path)
    if (!exist) {
      mkdirp.sync(path)
    }
  },
}
