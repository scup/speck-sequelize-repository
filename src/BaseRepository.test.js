const { expect } = require('chai')
const sinon = require('sinon')

const BaseRepository = require('./BaseRepository')

describe('BaseRepository', () => {
  let repository
  let sequelizeModel
  let mapper

  it('does not read primary of non models', () => {
    const baseRepository = BaseRepository.for()

    expect(baseRepository.primaryKeys).to.be.undefined
  })

  beforeEach('Prepare repository', () => {
    sequelizeModel = {
      primaryKeys: {
        primaryKey1: null
      }
    }
    mapper = {}

    repository = BaseRepository.for(sequelizeModel, mapper)
  })

  describe('#save', () => {
    it('saves the instance as a new Record mantaning Instance values', () => {
      const newRecordInstance = {
        primaryKey1: null,
        anyField: 'original value',
        createdAt: null
      }
      const savedRecordInstance = {
        primaryKey1: 'pk filled',
        anyField: 'modified value',
        createdAt: 'created filled'
      }

      const resultAssigned = {
        primaryKey1: 'pk filled',
        anyField: 'original value',
        createdAt: 'created filled'
      }

      mapper.toDatabase = sinon.mock()
        .withExactArgs(newRecordInstance)
        .returns(newRecordInstance)

      mapper.toEntity = sinon.mock()
        .withExactArgs(savedRecordInstance)
        .returns(savedRecordInstance)

      mapper.createEntity = sinon.mock()
        .withExactArgs(resultAssigned, true)
        .returns(resultAssigned)

      sequelizeModel.build = sinon.mock()
        .withArgs(newRecordInstance, { isNewRecord: true })
        .returns(sequelizeModel)

      sequelizeModel.save = sinon.mock()
        .withExactArgs()
        .returns(Promise.resolve(savedRecordInstance))

      return repository.save(newRecordInstance)
        .then(result => expect(result).to.deep.equal(resultAssigned))
    })
  })

  describe('#delete', () => {
    it('delete the instance', () => {
      const newRecordInstance = 'removed'
      const resultInstance = newRecordInstance

      mapper.toDatabase = sinon.stub()
        .withArgs(newRecordInstance)
        .returns(newRecordInstance)

      sequelizeModel.build = sinon.stub()
        .withArgs(newRecordInstance)
        .returns(sequelizeModel)

      sequelizeModel.destroy = sinon.stub()
        .withArgs()
        .returns(Promise.resolve(newRecordInstance))

      return repository.delete(newRecordInstance)
        .then(result => expect(result).to.equal(resultInstance))
    })
  })

  describe('#updateFields', () => {
    it('updates fields by when pass object', () => {
      const recordInstance = {
        myField: 'new value'
      }

      const expectedColumnsToChange = {
        myField: recordInstance.myField
      }

      repository.update = sinon.mock()
        .once()
        .withExactArgs(expectedColumnsToChange, ['myField'], {}, [])
        .returns(Promise.resolve('update result'))

      return repository.updateFields(recordInstance, {
        myField: 'new value'
      }).then(result => expect(recordInstance).to.deep.equal({ myField: 'new value' }))
    })
  })

  describe('#update', () => {
    it('updates the specified fields of the instance\'s Record ', () => {
      const recordInstance = {
        primaryKey1: 'pk1',
        fieldToUpdate: 'new value',
        nullFieldToUpdate: null,
        fieldToKeepUnchanged: 'value'
      }

      const fieldsToUpdate = [ 'fieldToUpdate', 'nullFieldToUpdate' ]

      mapper.toDatabase = sinon.stub()
      mapper.toDatabase
        .withArgs({ fieldToUpdate: recordInstance.fieldToUpdate, nullFieldToUpdate: 'NULL' })
        .returns({ fieldToUpdate: recordInstance.fieldToUpdate, nullFieldToUpdate: 'NULL' })
      mapper.toDatabase
        .withArgs({ primaryKey1: recordInstance.primaryKey1 })
        .returns({ primaryKey1: recordInstance.primaryKey1 })

      const expectedColumnsToChange = {
        fieldToUpdate: recordInstance.fieldToUpdate,
        nullFieldToUpdate: recordInstance.nullFieldToUpdate
      }
      const expectedConstraints = {
        where: {
          primaryKey1: recordInstance.primaryKey1
        },
        fields: fieldsToUpdate
      }

      sequelizeModel.update = sinon.mock()
        .once()
        .withExactArgs(expectedColumnsToChange, expectedConstraints)
        .returns(Promise.resolve('update result'))

      return repository.update(recordInstance, fieldsToUpdate)
        .then(result => expect(recordInstance).to.equal(result))
    })

    it('updates with no primary key field', () => {
      const recordInstance = {
        noPrimaryKey: 'npk1',
        fieldToUpdate: 'new value',
        nullFieldToUpdate: null,
        fieldToKeepUnchanged: 'value'
      }

      const fieldsToUpdate = [ 'fieldToUpdate', 'nullFieldToUpdate' ]
      const whereFields = [ 'noPrimaryKey' ]

      mapper.toDatabase = sinon.stub()
      mapper.toDatabase
        .withArgs({ fieldToUpdate: recordInstance.fieldToUpdate, nullFieldToUpdate: 'NULL' })
        .returns({ fieldToUpdate: recordInstance.fieldToUpdate, nullFieldToUpdate: 'NULL' })
      mapper.toDatabase
        .withArgs({ primaryKey1: undefined, noPrimaryKey: recordInstance.noPrimaryKey })
        .returns({ primaryKey1: undefined, noPrimaryKey: recordInstance.noPrimaryKey })

      const expectedColumnsToChange = {
        fieldToUpdate: recordInstance.fieldToUpdate,
        nullFieldToUpdate: recordInstance.nullFieldToUpdate
      }
      const expectedConstraints = {
        where: {
          primaryKey1: undefined,
          noPrimaryKey: recordInstance.noPrimaryKey
        },
        fields: fieldsToUpdate
      }

      sequelizeModel.update = sinon.mock()
        .once()
        .withExactArgs(expectedColumnsToChange, expectedConstraints)
        .returns(Promise.resolve('update result'))

      return repository.update(recordInstance, fieldsToUpdate, {}, whereFields)
        .then(result => expect(recordInstance).to.equal(result))
    })

    it('update relationship fields', () => {
      const recordInstance = {
        primaryKey1: 'pk1',
        relationship: {
          fieldToUpdate: 'new value'
        }
      }

      const fieldsToUpdate = []
      const relationshipFields = { fieldToUpdate: 'some value' }

      mapper.toDatabase = sinon.stub()
      mapper.toDatabase
        .withArgs({})
        .returns({})
      mapper.toDatabase
        .withArgs({ primaryKey1: recordInstance.primaryKey1 })
        .returns({ primaryKey1: recordInstance.primaryKey1 })

      const expectedConstraints = {
        where: {
          primaryKey1: recordInstance.primaryKey1
        },
        fields: ['fieldToUpdate']
      }

      sequelizeModel.update = sinon.mock()
        .once()
        .withExactArgs(relationshipFields, expectedConstraints)
        .returns(Promise.resolve('update result'))

      return repository.update(recordInstance, fieldsToUpdate, relationshipFields)
        .then(result => expect(recordInstance).to.equal(result))
    })
  })

  describe('#findOneBy/#findAllBy', () => {
    const methods = [{
      toTest: 'findOneBy',
      onSequelize: 'findOne'
    }, {
      toTest: 'findAllBy',
      onSequelize: 'findAll'
    }]

    methods.forEach((method) => {
      it(`maps result to mapper.toEntity method using ${method.toTest}`, () => {
        const findOptions = { where: 'myCondition' }
        const sequelizeResult = { databaseField: 'myDatabaseResult' }
        const myResult = { field: 'myResult' }

        sequelizeModel[method.onSequelize] = sinon.mock()
          .once()
          .withExactArgs(findOptions)
          .returns(Promise.resolve(sequelizeResult))

        mapper.toEntity = sinon.mock()
          .once()
          .withExactArgs(sequelizeResult)
          .returns(myResult)

        return expect(repository[method.toTest](findOptions)).to.eventually.deep.equal(myResult)
      })
    })
  })

  describe('#countByCriterias', () => {
    it('counts the number of registers, given criteria', () => {
      const criterias = 'criterias'
      sequelizeModel.count = sinon.mock()
        .once()
        .withExactArgs({ where: criterias })
        .returns('count result')

      expect(repository.countByCriterias(criterias)).to.equal('count result')
    })
  })

  context('helpers method', () => {
    let mockRepository

    beforeEach(() => { mockRepository = sinon.mock(repository) })

    afterEach(() => mockRepository.restore())

    describe('#findAllByCriterias', () => {
      it('Finds registers which are not soft-deleted ', () => {
        const where = { field: 'anyWhere condition' }

        mockRepository.expects('findAllBy')
          .withExactArgs({ where, raw: true, paranoid: true })
          .returns('mock result')

        expect(repository.findAllByCriterias(where)).to.equal('mock result')
      })

      it('Finds registers ignoring the soft-delete flag', () => {
        const where = { field: 'anyWhere condition' }

        mockRepository.expects('findAllBy')
          .withExactArgs({ where, raw: true, paranoid: false })
          .returns('mock result')

        expect(repository.findAllByCriterias(where, { paranoid: false })).to.equal('mock result')
      })
    })

    it('finds one by criterias', () => {
      const where = { field: 'anyWhere condition' }

      mockRepository.expects('findOneBy')
        .withExactArgs({ where, raw: true })
        .returns('mock result')

      expect(repository.findOneByCriterias(where)).to.equal('mock result')
    })

    it('finds one by id', () => {
      const id = 'anyId'

      mockRepository.expects('findOneBy')
        .withExactArgs({
          where: { primaryKey1: id },
          raw: true
        })
        .returns('mock result')

      expect(repository.findOneById(id)).to.equal('mock result')
    })
  })
})
