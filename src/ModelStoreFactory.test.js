const sinon = require('sinon')
const { expect } = require('chai')

const modelStoreFactory = require('./ModelStoreFactory')

describe('modelStoreFactory', () => {
  let Sequelize
  let sequelizeInstance
  let fs
  let model
  let modelAssociate
  let configuration
  let modelStore
  let injectedModels

  before('calls modelStoreFactory.create with mocks', () => {
    model = {
      name: 'model'
    }

    modelAssociate = {
      name: 'modelAssociate',
      associate: sinon.mock()
    }

    injectedModels = [
      () => sinon.stub({ name: 'mymodule' })
    ]

    modelAssociate.associate
      .once()
      .withExactArgs({ model, modelAssociate, mymodule: { name: 'mymodule' } })

    configuration = {
      database: {
        database: 'some database',
        username: 'some username',
        password: 'some password'
      },
      files: {
        rootDir: 'some root dir',
        models: injectedModels
      }
    }

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

    Sequelize = sinon.mock()
    Sequelize.once()
      .withExactArgs(
        configuration.database.database,
        configuration.database.username,
        configuration.database.password,
        configuration.database
      ).returns(sequelizeInstance)

    fs = {
      readdirSync: sinon.mock()
    }

    fs.readdirSync.once().withExactArgs(configuration.files.rootDir).returns(files)

    modelStore = modelStoreFactory.create(configuration, {
      join: (directory, filename) => `${directory}/${filename}`,
      fs,
      Sequelize
    })
  })

  it('build Sequelize using the configuration', () => Sequelize.verify())

  it('append sequelize instance to modelStore', () => expect(modelStore).to.have.property('sequelize', sequelizeInstance))

  it('reads the directory look for file *.model.js', () => fs.readdirSync.verify())

  it('reduce the models to modelStore', () => {
    expect(modelStore).to.have.property('model', model)
    expect(modelStore).to.have.property('modelAssociate', modelAssociate)
  })

  it('associates models', () => modelAssociate.associate.verify())
})
