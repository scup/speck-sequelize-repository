const sinon = require('sinon')
const { expect } = require('chai')

const initialize = require('./initialize')

describe('initialize', () => {
  let configuration
  let sequelize

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

    sequelize = {
      config: {
        database: 'some database',
        host: 'some host',
        port: 'some port'
      }
    }

    modelStoreMock = {
      sequelize: {
        sync: sinon.mock()
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
    before(() => {
      modelStoreMock.sequelize.sync = sinon.mock()
        .once()
        .returns(Promise.resolve(sequelize))

      modelStoreFactoryMock.create = sinon.mock()
        .once()
        .withArgs(configuration)
        .returns(modelStoreMock)

      consoleMock.log = sinon.mock()
        .once()
        .withExactArgs(`Connected to database ${sequelize.config.database} on ${sequelize.config.host}:${sequelize.config.port}`)

      initializeResult = initialize(configuration, { modelStoreFactory: modelStoreFactoryMock, console: consoleMock })
    })

    it('syncronizes with sequelize', () => modelStoreMock.sequelize.sync.verify())
    it('creates a model store', () => modelStoreFactoryMock.create.verify())
    it('log a status message on console', () => consoleMock.log.verify())
    it('returns a model store', () => expect(initializeResult).to.be.eventually.equal(modelStoreMock))
  })

  describe('do not initialize due error', () => {
    let error

    before(() => {
      error = 'an error'

      modelStoreMock.sequelize.sync = sinon.mock()
        .once()
        .returns(Promise.reject(error))

      modelStoreFactoryMock.create = sinon.mock()
        .once()
        .withArgs(configuration)
        .returns(modelStoreMock)

      consoleMock.log = sinon.mock()
        .once()
        .withExactArgs(`Could not connect to database`, error)

      initializeResult = initialize(configuration, { modelStoreFactory: modelStoreFactoryMock, console: consoleMock })
    })

    it('syncronizes with sequelize', () => modelStoreMock.sequelize.sync.verify())
    it('creates a model store', () => modelStoreFactoryMock.create.verify())
    it('log an error message on console', () => consoleMock.log.verify())
    it('returns an error', () => expect(initializeResult).to.be.eventually.rejectedWith(error))
  })

  describe('do not connect in database', () => {
    before(() => {
      configuration.skipConnection = true

      modelStoreMock.sequelize.sync = sinon.mock()
        .never()

      modelStoreFactoryMock.create = sinon.mock()
        .once()
        .withArgs(configuration)
        .returns(modelStoreMock)

      consoleMock.log = sinon.mock()
        .never()

      initializeResult = initialize(configuration, { modelStoreFactory: modelStoreFactoryMock, console: consoleMock })
    })

    after(() => {
      delete configuration.skipConnection
    })

    it('does not syncronizes with sequelize', () => modelStoreMock.sequelize.sync.verify())
    it('creates a model store', () => modelStoreFactoryMock.create.verify())
    it('does not log a status message on console', () => consoleMock.log.verify())
    it('returns a model store', () => expect(initializeResult).to.be.eventually.equal(modelStoreMock))
  })
})
