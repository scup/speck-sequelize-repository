const sinon = require('sinon')
const { expect } = require('chai')

const modelStoreFactory = require('./ModelStoreFactory')

let Sequelize
let sequelizeInstance
let fs
let model
let modelAssociate
let configuration
let modelStore

const createDependencies = (config) => {
  model = {
    name: 'model'
  }

  modelAssociate = {
    name: 'modelAssociate',
    associate: sinon.mock('associate'),
    mymodule: sinon.mock('mymodule')
  }

  modelAssociate.associate
    .twice()
    .withExactArgs({ model, modelAssociate })

  configuration = config

  const files = [
    'package.json',
    'modelStoreFactory.js',
    'model.model.js',
    'modelAssociate.model.js'
  ]

  sequelizeInstance = {
    import: sinon.stub()
  }

  sequelizeInstance.import
    .withArgs(`${configuration.files.rootDir}/model.model.js`)
    .returns(model)
    .withArgs(`${configuration.files.rootDir}/modelAssociate.model.js`)
    .returns(modelAssociate)

  Sequelize = sinon.mock('Sequelize')
  Sequelize.twice()
    .withExactArgs(
      configuration.database.database,
      configuration.database.username,
      configuration.database.password,
      configuration.database
    ).returns(sequelizeInstance)

  modelAssociate.mymodule
    .twice()
    // .withArgs(sequelizeInstance, Sequelize)
    .returns(modelAssociate)

  fs = {
    readdirSync: sinon.mock('fs').twice()
  }

  fs.readdirSync.twice().withExactArgs(configuration.files.rootDir).returns(files)

  modelStore = modelStoreFactory.create(configuration, {
    join: (directory, filename) => `${directory}/${filename}`,
    fs,
    Sequelize
  })
}

describe('modelStoreFactory', () => {
  before('calls modelStoreFactory.create with mocks', () => {
    createDependencies({
      database: {
        database: 'some database',
        username: 'some username',
        password: 'some password'
      },
      files: {
        rootDir: 'some root dir'
      }
    })
  })

  it('append sequelize instance to modelStore', () => expect(modelStore).to.have.property('sequelize', sequelizeInstance))

  it('reduce the models to modelStore', () => {
    expect(modelStore).to.have.property('model', model)
    expect(modelStore).to.have.property('modelAssociate', modelAssociate)
  })

  describe('modelStoreFactory', () => {
    before('calls modelStoreFactory.create with mocks', () => {
      let injectedModels = [
        modelAssociate.mymodule
      ]

      createDependencies({
        database: {
          database: 'some database',
          username: 'some username',
          password: 'some password'
        },
        files: {
          rootDir: 'some root dir',
          models: injectedModels
        }
      })

      modelStore = modelStoreFactory.create(configuration, {
        join: (directory, filename) => `${directory}/${filename}`,
        fs,
        Sequelize
      })
    })

    it('reads the directory look for file *.model.js', () => fs.readdirSync.verify())
    it('build Sequelize using the configuration', () => Sequelize.verify())
    // it('injection models', () => modelAssociate.mymodule.verify())
    it('associates models', () => modelAssociate.associate.verify())
  })
})
