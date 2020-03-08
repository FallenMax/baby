import * as Multer from '@koa/multer'
import { promises as fs } from 'fs'
import * as mkdirp from 'mkdirp'

export type File = Multer.File

/**
 * manage uploaded file
 */
export const fileService = {
  async isExist(path: string): Promise<boolean> {
    try {
      const stats = await fs.stat(path)
      return true
    } catch (error) {
      return false
    }
  },
  async ensureDirectory(path: string): Promise<void> {
    const exist = await fileService.isExist(path)
    if (!exist) {
      mkdirp.sync(path)
    }
  },
  isFile(o: any): o is File {
    return Boolean(o && o.encoding && o.mimetype && o.buffer && o.originalname)
  },
  getFileExtension(file: string | File): string {
    if (typeof file === 'string') {
      return file.split('.').pop() || ''
    } else {
      return file.originalname.split('.').pop() || ''
    }
  },
}
