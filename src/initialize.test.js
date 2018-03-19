const sinon = require('sinon')
const { expect } = require('chai')

const initialize = require('./initialize')

describe('initialize', () => {
  let configuration

  let modelStoreMock
  let modelStoreFactoryMock
  let consoleMock

  let initializeResult

  before('Mocks', () => {
    configuration = {
      database: {
        database: 'some database',
        username: 'some username',
        password: 'some password'
      },
      files: {
        rootDir: 'some root dir'
      }
    }

    modelStoreMock = {
      sequelize: {
        validate: sinon.mock(),
        config: configuration
      }
    }

    modelStoreFactoryMock = {
      create: sinon.mock()
    }

    consoleMock = {
      log: sinon.mock()
    }
  })

  describe('initializes the sequelize successfully', () => {
    before(async () => {
      modelStoreMock.sequelize.validate = sinon.mock().resolves()

      modelStoreFactoryMock.create = sinon.mock()
        .withArgs(configuration)
        .returns(modelStoreMock)

      consoleMock.log = sinon.mock()
        .withExactArgs(`Connected to database ${configuration.database} on ${configuration.host}:${configuration.port}`)

      initializeResult = await initialize(configuration, { modelStoreFactory: modelStoreFactoryMock, console: consoleMock })
    })

    it('validates with sequelize', () => modelStoreMock.sequelize.validate.verify())
    it('creates a model store', () => modelStoreFactoryMock.create.verify())
    it('log a status message on console', () => consoleMock.log.verify())
    it('returns a model store', () => expect(initializeResult).to.equal(modelStoreMock))
  })

  describe('do not initialize due error', () => {
    let error

    before(() => {
      error = 'an error'

      modelStoreMock.sequelize.validate = sinon.mock()
        .rejects({ message: error })

      modelStoreFactoryMock.create = sinon.mock()
        .withArgs(configuration)
        .returns(modelStoreMock)

      consoleMock.log = sinon.mock()
        .withExactArgs(`Could not connect to database`, sinon.match.any)

      initializeResult = initialize(configuration, { modelStoreFactory: modelStoreFactoryMock, console: consoleMock })
      return initializeResult.catch(() => {})
    })

    it('validates with sequelize', () => modelStoreMock.sequelize.validate.verify())
    it('creates a model store', () => modelStoreFactoryMock.create.verify())
    it('log an error message on console', () => consoleMock.log.verify())
    it('returns an error', () => expect(initializeResult).to.eventually.rejectedWith(error))
  })

  describe('do not connect in database', () => {
    before(() => {
      configuration.skipConnection = true

      modelStoreMock.sequelize.validate = sinon.mock().never()

      modelStoreFactoryMock.create = sinon.mock()
        .withArgs(configuration)
        .returns(modelStoreMock)

      consoleMock.log = sinon.mock().never()

      initializeResult = initialize(configuration, { modelStoreFactory: modelStoreFactoryMock, console: consoleMock })
      return initializeResult
    })

    after(() => {
      delete configuration.skipConnection
    })

    it('does not validate with sequelize', () => modelStoreMock.sequelize.validate.verify())
    it('creates a model store', () => modelStoreFactoryMock.create.verify())
    it('does not log a status message on console', () => consoleMock.log.verify())
    it('returns a model store', () => expect(initializeResult).to.be.eventually.equal(modelStoreMock))
  })
})
