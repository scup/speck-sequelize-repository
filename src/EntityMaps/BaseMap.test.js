const { expect } = require('chai')

const BaseMap = require('./BaseMap')

describe('BaseMap', () => {
  let baseMap
  const map = {
    'toEntity': { 'a': 'a.aId', 'b': 'b.bId' },
    'toDatabase': { 'a.aId': 'a', 'b.bId': 'b' }
  }
  const entity = Object

  before('Mocks', () => {
    baseMap = new BaseMap(entity, map)
  })

  describe('#toEntity', () => {
    it('Parse data to Entity', () => {
      const data = {
        a: 1,
        b: 2
      }

      const dataResult = {
        a: { aId: 1 },
        b: { bId: 2 }
      }

      expect(baseMap.toEntity(data)).to.deep.equal(dataResult)
    })
  })

  describe('#toDatabase', () => {
    it('Parse data to Database', () => {
      const data = {
        a: { aId: 1 },
        b: { bId: 2 }
      }
      const dataResult = {
        a: 1,
        b: 2
      }

      expect(baseMap.toDatabase(data)).to.deep.equal(dataResult)
    })
  })
})
