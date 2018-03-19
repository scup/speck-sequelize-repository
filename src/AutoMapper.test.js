const { expect } = require('chai')

const AutoMapper = require('./AutoMapper')

describe('AutoMapper', () => {
  describe('#createMapFromEntity', () => {
    const someEntity = {
      SCHEMA: {
        someEntityId: '',
        someEntityField: '',
        someEntityFieldToBeExcluded: '',
        someEntityRelationShip: { type: { name: 'OtherEntity' } },
        someEntityRelationShipToBeOverrided: { type: { name: 'OtherEntityToOverride' } },
        someEntityDate: { type: { name: 'Date' } }
      }
    }

    const mapResult = new AutoMapper().createMapFromEntity(someEntity, {
      override: {
        someEntityRelationShipToBeOverrided: 'overrided.field'
      },
      exclude: ['someEntityFieldToBeExcluded']
    })
    const autoMapped = mapResult.map

    it('Common field just do simple map', () => {
      expect(autoMapped.toEntity.someEntityField).to.equals('someEntityField')
      expect(autoMapped.toDatabase.someEntityField).to.equals('someEntityField')
    })

    it('Relationship field create automatically map', () => {
      expect(autoMapped.toEntity.someEntityRelationShipId).to.equals('someEntityRelationShip.someEntityRelationShipId')
      expect(autoMapped.toDatabase['someEntityRelationShip.someEntityRelationShipId']).to.equals('someEntityRelationShipId')
    })

    it('Relationship date field do simple map', () => {
      expect(autoMapped.toEntity.someEntityDate).to.equals('someEntityDate')
      expect(autoMapped.toDatabase.someEntityDate).to.equals('someEntityDate')
    })

    it('Overrided fields should use override data instead automapped data', () => {
      expect(autoMapped.toEntity.someEntityRelationShipToBeOverridedId).to.equals('someEntityRelationShipToBeOverrided.someEntityRelationShipToBeOverridedId')
      expect(autoMapped.toDatabase['overrided.field']).to.equals('someEntityRelationShipToBeOverridedId')
    })

    it('Field marked as excluded should not be mapped', () => {
      expect(autoMapped.toEntity.someEntityFieldToBeExcluded).to.equal(undefined)
      expect(autoMapped.toDatabase.someEntityFieldToBeExcluded).to.equal(undefined)
    })

    it('Map without specifying opitions', () => {
      const someEntity = {
        SCHEMA: {
          someEntityId: ''
        }
      }

      const mapResult = new AutoMapper().createMapFromEntity(someEntity)
      const autoMapped = mapResult.map

      expect(autoMapped.toEntity.someEntityId).to.equals('someEntityId')
      expect(autoMapped.toDatabase.someEntityId).to.equals('someEntityId')
    })
  })
})
