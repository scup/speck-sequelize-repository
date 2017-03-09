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

    it('Parse a data array to a Entity array', () => {
      const data = [
        {
          a: 1,
          b: 2
        },
        {
          a: 3,
          b: 4
        }
      ]

      const dataResult = [
        {
          a: { aId: 1 },
          b: { bId: 2 }
        },
        {
          a: { aId: 3 },
          b: { bId: 4 }
        }
      ]

      expect(baseMap.toEntity(data)).to.deep.equal(dataResult)
    })

    it('Returns null when data is not defined', () => {
      expect(baseMap.toEntity(null)).to.equal(null)
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

    it('Parse a data array to a Database array', () => {
      const data = [
        {
          a: { aId: 1 },
          b: { bId: 2 }
        },
        {
          a: { aId: 3 },
          b: { bId: 4 }
        }
      ]

      const dataResult = [
        {
          a: 1,
          b: 2
        },
        {
          a: 3,
          b: 4
        }
      ]

      expect(baseMap.toDatabase(data)).to.deep.equal(dataResult)
    })

    it('Returns null when data is not defined', () => {
      expect(baseMap.toDatabase(null)).to.equal(null)
    })
  })
})
