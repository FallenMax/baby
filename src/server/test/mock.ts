import { recordService } from '../service/record.service'
import { userService } from '../service/user.service'

export const fillMockData = async () => {
  try {
    await userService.register({ name: 'TEST', password: '123456' })
  } catch (error) {
    await userService.login({ name: 'TEST', password: '123456' })
  }
  const user = await userService.getByName('TEST')
  if (!user) {
    throw new Error('user not found')
  }
  const records = await recordService.getRecords({ babyId: user.id })
  // if (records.length) {
  //   return
  // }
  for (const rec of records) {
    await recordService.deleteRecordById(rec.id)
  }

  // const days = 365 * 2
  // const now = new Date().getTime()
  // let start = now - days * DAY
  // let isSleeping = false
  // let newRecords: Records.RecordDraft[] = []
  // while (start < now) {
  //   const time = new Date(start)

  //   const dice = Math.random()
  //   switch (true) {
  //     case dice < 0.2: {
  //       newRecords.push({
  //         type: isSleeping ? 'wakeup' : 'sleep',
  //         time,
  //       })
  //       isSleeping = !isSleeping
  //       break
  //     }
  //     case dice < 0.4: {
  //       newRecords.push({
  //         type: 'eat',
  //         food: 'formula_milk',
  //         amount: Math.floor(Math.random() * 240),
  //         time,
  //       })
  //       break
  //     }

  //     case dice < 0.6: {
  //       newRecords.push({
  //         type: 'eat',
  //         food: 'breast_milk',
  //         amount: Math.floor(Math.random() * 240),
  //         time,
  //       })
  //       break
  //     }
  //     case dice < 0.8: {
  //       newRecords.push({
  //         type: 'eat',
  //         food: 'baby_food',
  //         time,
  //       })
  //       break
  //     }
  //     case dice < 0.9: {
  //       newRecords.push({
  //         type: 'piss',
  //         time,
  //       })
  //       break
  //     }
  //     case dice < 1: {
  //       newRecords.push({
  //         type: 'poop',
  //         time,
  //       })
  //       break
  //     }
  //   }

  //   start += Math.floor(Math.random() * HOUR * 6)
  // }
  // for (let index = 0; index < newRecords.length; index++) {
  //   const rec = newRecords[index]
  //   console.log(`adding ${index}/${newRecords.length}`)
  //   await recordService.createRecord(rec, user)
  // }
  // console.info('done')
}
