import { Assert } from '../../assert/index'
import { resolveDatabase } from '../resolve'

describe('redis/RedisSortedSet', () => {
  // ---------------------------------------------------------
  // add
  // ---------------------------------------------------------

  it('Should add values', async () => {
    const database = await resolveDatabase()
    const sortedSet = database.sortedset('scores')
    const addResult = await sortedSet.add([[20, {name: 'User1', age: 23}]])
    Assert.deepEqual(addResult, 1)
  })

  it('Should add multiple values', async () => {
    const database = await resolveDatabase()
    const sortedSet = database.sortedset('scores')
    const addResult = await sortedSet.add([
      [20, { name: 'User1', age: 23 }],
      [25, { name: 'User2', age: 22 }],
      [10, { name: 'User3', age: 23 }],
    ])
    Assert.deepEqual(addResult, 3)
  })

  it('Should report correct cardinality', async () => {
    const database = await resolveDatabase()
    const sortedSet = database.sortedset('scores')
    await sortedSet.add([[20, {name: 'User1', age: 23}]])
    const count = await database.sortedset('scores').count()
    Assert.deepEqual(count, 1)
  })

  // ---------------------------------------------------------
  // Collect
  // ---------------------------------------------------------

  it('Should report correct order within range', async () => {
    const database = await resolveDatabase()
    const sortedSet = database.sortedset('scores')
    await sortedSet.add([[20, { name: 'User1', age: 23 }]])
    await sortedSet.add([[24, { name: 'User2', age: 20 }]])
    await sortedSet.add([[25, { name: 'User4', age: 23 }]])
    await sortedSet.add([[50, { name: 'User5', age: 22 }]])
    await sortedSet.add([[30, {name: 'User3', age: 25}]])
    const topThree = await sortedSet.getRange(0, 2)
    Assert.deepEqual(topThree.length, 3)
    Assert.deepEqual(topThree[0].name, 'User1')
    Assert.deepEqual(topThree[1].name, 'User2')
    Assert.deepEqual(topThree[2].name, 'User4')
  })

  it('Should report correct reverse order within range', async () => {
    const database = await resolveDatabase()
    const sortedSet = database.sortedset('scores')
    await sortedSet.add([[20, { name: 'User1', age: 23 }]])
    await sortedSet.add([[24, { name: 'User2', age: 20 }]])
    await sortedSet.add([[25, { name: 'User4', age: 23 }]])
    await sortedSet.add([[50, { name: 'User5', age: 22 }]])
    await sortedSet.add([[30, {name: 'User3', age: 25}]])
    const topThree = await sortedSet.getRange(0, 2, true)
    Assert.deepEqual(topThree.length, 3)
    Assert.deepEqual(topThree[0].name, 'User5')
    Assert.deepEqual(topThree[1].name, 'User3')
    Assert.deepEqual(topThree[2].name, 'User4')
  })

  it('Should include scores when specified', async () => {
    const database = await resolveDatabase()
    const sortedSet = database.sortedset('scores')
    await sortedSet.add([[20, { name: 'User1', age: 23 }]])
    await sortedSet.add([[24, { name: 'User2', age: 20 }]])
    await sortedSet.add([[25, { name: 'User4', age: 23 }]])
    await sortedSet.add([[50, { name: 'User5', age: 22 }]])
    await sortedSet.add([[30, {name: 'User3', age: 25}]])
    const topThree = await sortedSet.getRangeWithScores(0, 2)
    Assert.deepEqual(topThree.length, 3)
    Assert.deepEqual(topThree[0][1].name, 'User1')
    Assert.deepEqual(topThree[0][0], 20)
    Assert.deepEqual(topThree[1][1].name, 'User2')
    Assert.deepEqual(topThree[1][0], 24)
    Assert.deepEqual(topThree[2][1].name, 'User4')
    Assert.deepEqual(topThree[2][0], 25)
  })

  // ---------------------------------------------------------
  // Type Assertions
  // ---------------------------------------------------------

  it('Should throw add invalid value', async () => {
    const database = await resolveDatabase()
    const sortedset = database.sortedset('scores')
    // @ts-ignore
    await Assert.throwsAsync(async () => await sortedset.add([[0, 0]]))
  })
})
