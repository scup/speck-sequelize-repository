const sinon = require('sinon')
const { expect } = require('chai')

const sequelizeModels = require('./sequelizeModels')

describe('sequelizeModels', () => {
  let Sequelize
  let sequelizeInstance
  let fs
  let model
  let modelAssociate

  before('calls sequelizeModels.configure with mocks', () => {
    model = {
      name: 'model'
    }

    modelAssociate = {
      name: 'modelAssociate',
      associate: sinon.mock()
    }

    modelAssociate.associate
      .once()
      .withExactArgs({ model, modelAssociate })

    const dirName = 'some_dir'

    const configuration = {
      database: {
        database: 'some_database_address',
        username: 'some_username',
        password: 'some_password'
      },
      files: {
        modelDir: dirName
      }
    }

    const files = [
      'package.json',
      'sequelizeModels.js',
      'model.model.js',
      'modelAssociate.model.js'
    ]

    sequelizeInstance = {
      import: sinon.stub()
    }

    sequelizeInstance.import
      .withArgs(`${dirName}/model.model.js`)
      .returns(model)
      .withArgs(`${dirName}/modelAssociate.model.js`)
      .returns(modelAssociate)

    const databaseConfig = configuration.database

    Sequelize = sinon.mock()
      .once()
      .withExactArgs(
        databaseConfig.database,
        databaseConfig.username,
        databaseConfig.password,
        databaseConfig
      )
      .returns(sequelizeInstance)

    fs = {
      readdirSync: sinon.mock()
    }

    fs.readdirSync
      .once()
      .withExactArgs(dirName)
      .returns(files)

    const dependencies = {
      configuration,
      join: (directory, filename) => `${directory}/${filename}`,
      fs,
      Sequelize
    }

    sequelizeModels.configure(configuration, dependencies)
  })

  it('build Sequelize using the configuration', () => Sequelize.verify())

  it('append sequelize instance to sequelizeModels', () => expect(sequelizeModels).to.have.property('sequelize', sequelizeInstance))

  it('reads the directory look for file *.model.js', () => fs.readdirSync.verify())

  it('reduce the models to sequelizeModels', () => {
    expect(sequelizeModels).to.have.property('model', model)
    expect(sequelizeModels).to.have.property('modelAssociate', modelAssociate)
  })

  it('associates models', () => modelAssociate.associate.verify())
})
