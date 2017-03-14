const path = require('path')

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

const readModels = (sequelize, rootDir, extensionRegex, injection) => {
  const { join, fs } = Object.assign({}, dependencies, injection)

  const models = fs
    .readdirSync(rootDir)
    .filter(file => filterModelFiles(file, rootDir, extensionRegex))
    .reduce(importModel(sequelize, join, rootDir), {})

  Object.keys(models).forEach(associateModels(models))

  return models
}

const create = (configuration, injection) => {
  const { Sequelize } = Object.assign({}, dependencies, injection)

  const databaseConfiguration = configuration.database

  const { rootDir, extensionRegex } = configuration.files

  const sequelize = new Sequelize(
    databaseConfiguration.database,
    databaseConfiguration.username,
    databaseConfiguration.password,
    databaseConfiguration
  )

  const models = readModels(sequelize, rootDir, extensionRegex, injection)

  return Object.assign({}, models, { sequelize })
}

const modelStoreFactory = {
  create
}

module.exports = modelStoreFactory
