import { openDatabase } from './database'

test('database', async () => {
  let item1 = {
    id: '1',
    number: 1,
    string: '1',
    date: new Date('1999-01-01 00:00:00'),
    null: null,
    undefined: undefined,
    object: {
      number: 11,
      string: '11',
      date: new Date('1999-01-01 00:00:00'),
    },
    array: [
      {
        number: 111,
        string: '111',
        date: new Date('1999-01-01 00:00:00'),
      },
    ],
  }
  let item2 = {
    id: '2',
    number: 2,
    string: '2',
    date: new Date('1999-01-01 00:00:00'),
    null: null,
    undefined: undefined,
    object: {
      number: 22,
      string: '22',
      date: new Date('1999-01-01 00:00:00'),
    },
    array: [
      {
        number: 222,
        string: '222',
        date: new Date('1999-01-01 00:00:00'),
      },
    ],
  }

  // initial
  const db = openDatabase<any>('TEST')
  await db.removeMulti({}) // reset
  db.setIndex('id')

  // add
  await db.add(item1)
  await db.add(item2)

  // findall
  const allFound = (await db.findAll()).sort((a, b) => a.id - b.id)
  expect(allFound.length).toBe(2)
  expect(allFound[0]).toMatchObject(item1)
  expect(allFound[1]).toMatchObject(item2)

  // findone
  expect(await db.findOne({ id: item1.id })).toMatchObject(item1)
  expect(await db.findOne({ id: item2.id })).toMatchObject(item2)
  expect(await db.findOne({ id: 'x' })).toBeFalsy()

  // update
  const patch1 = { number: 11 }
  await db.update({ id: item1.id }, patch1)
  expect(await db.findOne({ id: item1.id })).toMatchObject({
    ...item1,
    ...patch1,
  })

  // upsert
  await db.upsert({ id: item2.id }, item2)
  expect((await db.findAll()).length).toBe(2)
  const item3 = { ...item2, id: '3' }
  await db.upsert({ id: '3' }, item3)
  expect((await db.findAll()).length).toBe(3)

  // remove
  await db.remove({ id: '3' })
  expect((await db.findAll()).length).toBe(2)

  // removeMulti
  await db.removeMulti({})
  expect((await db.findAll()).length).toBe(0)
})
