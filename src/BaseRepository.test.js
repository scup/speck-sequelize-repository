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
    it('deletes the instance', async () => {
      const newRecordInstance = 'removed'
      const resultInstance = newRecordInstance

      mapper.toDatabase = sinon.stub()
        .withArgs(newRecordInstance)
        .returns(newRecordInstance)

      sequelizeModel.build = sinon.stub()
        .withArgs(newRecordInstance)
        .returns(sequelizeModel)

      sequelizeModel.destroy = sinon.mock()
        .withExactArgs(null)
        .resolves(newRecordInstance)

      const result = await repository.delete(newRecordInstance)
      sequelizeModel.destroy.verify()
      expect(result).to.equal(resultInstance)
    })

    it('deletes the instance with options', async () => {
      const newRecordInstance = 'removed'
      const resultInstance = newRecordInstance
      const options = { force: true }

      mapper.toDatabase = sinon.stub()
        .withArgs(newRecordInstance)
        .returns(newRecordInstance)

      sequelizeModel.build = sinon.stub()
        .withArgs(newRecordInstance)
        .returns(sequelizeModel)

      sequelizeModel.destroy = sinon.mock()
        .withExactArgs(options)
        .resolves(newRecordInstance)

      const result = await repository.delete(newRecordInstance, options)
      sequelizeModel.destroy.verify()
      expect(result).to.equal(resultInstance)
    })
  })

  describe('#deleteAllByCriterias', () => {
    it('deletes all instances matching a criteria', async () => {
      const criteria = { field: 'value' }

      sequelizeModel.destroy = sinon.mock()
        .withExactArgs({ where: { field: 'value' } })
        .resolves('delete result')

      const result = await repository.deleteAllByCriterias(criteria)
      sequelizeModel.destroy.verify()
      expect(result).to.equal('delete result')
    })

    it('deletes all instances matching a criteria, with options', async () => {
      const criteria = { field: 'value' }
      const options = { force: true }

      sequelizeModel.destroy = sinon.mock()
        .withExactArgs({ where: { field: 'value' }, force: true })
        .resolves('delete result')

      const result = await repository.deleteAllByCriterias(criteria, options)
      sequelizeModel.destroy.verify()
      expect(result).to.equal('delete result')
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

  describe('#updateByDiff', () => {
    it('Does not update when there are no changes', () => {
      const recordInstance = {
        primaryKey1: 'pk1',
        fieldToUpdate: 'old value',
        nullFieldToUpdate: null,
        fieldToKeepUnchanged: 'value'
      }

      const copy = Object.assign({}, recordInstance)

      const updateMock = sinon.mock(repository)
        .expects('update')
        .never()

      return repository.updateByDiff(recordInstance, copy)
        .then((result) => {
          expect(recordInstance).to.equal(result)

          updateMock.verify()
        })
    })

    it('Updates the instance', () => {
      const recordInstance = {
        primaryKey1: 'pk1',
        fieldToUpdate: 'old value',
        nullFieldToUpdate: null,
        fieldToKeepUnchanged: 'value'
      }

      const copy = Object.assign({}, recordInstance, {
        fieldToUpdate: 'new value',
        nullFieldToUpdate: 'not null anymore!'
      })

      const updateMock = sinon.mock(repository)
        .expects('update')
        .withExactArgs(copy, ['fieldToUpdate', 'nullFieldToUpdate'], undefined)
        .returns(Promise.resolve(copy))

      return repository.updateByDiff(recordInstance, copy)
        .then((result) => {
          expect(copy).to.equal(result)

          updateMock.verify()
        })
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
