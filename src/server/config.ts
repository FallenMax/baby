import * as path from 'path'
import { env, isDev } from './utils/env'

const rootDir = isDev
  ? path.resolve(__dirname, '../../')
  : path.resolve(__dirname, '../')

export const config = {
  keys: ['for loved ones'],
  port: Number(env.PORT || 3333),

  dataDir: env.DATA_DIR || path.resolve(rootDir, './data'),
  publicDir: env.PUBLIC_DIR || path.resolve(rootDir, './public'),
  uploadDir: env.UPLOAD_DIR || path.resolve(rootDir, './upload'),

  publicPath: env.PUBLIC_PATH || 'public',
  apiPath: env.API_PATH || 'api',
  uploadPath: env.PUBLIC_PATH || 'upload',
}
