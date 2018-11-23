const path = require('path')

const ModelStore = require('./ModelStore')

const dependencies = {
  Sequelize: require('sequelize'),
  join: path.join,
  fs: require('fs')
}

const filterModelFiles = (file, rootDir, extensionRegex) => {
  const regex = extensionRegex || /model\.js$/

  const rootDirBaseName = path.basename(rootDir)

  return regex.test(file) && file !== rootDirBaseName
}

const importModel = (sequelize, join, rootDir) => (models, file) => {
  const model = sequelize.import(join(rootDir, file))

  return Object.assign(models, { [model.name]: model })
}

const associateModels = (models) => (modelName) => {
  if ('associate' in models[modelName]) {
    models[modelName].associate(models)
  }
}

const readModels = (sequelize, rootDir, extensionRegex, injectedModels, injection) => {
  const { join, fs, Sequelize } = Object.assign({}, dependencies, injection)

  let models = {}

  if ((injectedModels || []).length > 0) {
    injectedModels.forEach((_module) => {
      const model = _module(sequelize, Sequelize)
      models[model.name] = model
    })
  }

  models = Object.assign(models, fs
    .readdirSync(rootDir)
    .filter(file => filterModelFiles(file, rootDir, extensionRegex))
    .reduce(importModel(sequelize, join, rootDir), {}))

  Object.keys(models).forEach(associateModels(models))

  return models
}

const create = (configuration, injection) => {
  const { Sequelize } = Object.assign({}, dependencies, injection)

  const databaseConfiguration = configuration.database

  const { rootDir, extensionRegex, models } = configuration.files

  const sequelize = new Sequelize(
    databaseConfiguration.database,
    databaseConfiguration.username,
    databaseConfiguration.password,
    databaseConfiguration
  )

  const loadedModels = readModels(sequelize, rootDir, extensionRegex, models, injection)

  return new ModelStore(Object.assign({}, loadedModels, { sequelize }))
}

const modelStoreFactory = {
  create
}

module.exports = modelStoreFactory
