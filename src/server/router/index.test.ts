import axios from 'axios'
import { config } from '../config'
import { quit, start } from '../server'

const port = config.port
const host = `http://localhost:${port}`

describe('routes', () => {
  beforeAll(async () => {
    await start()
  })

  afterAll(async () => {
    await quit()
  })

  beforeEach(async () => {})

  test('GET /api', async () => {
    const result = (await axios.get(`${host}/api`)).data
    expect(result).toBe('ok')
  })
})
