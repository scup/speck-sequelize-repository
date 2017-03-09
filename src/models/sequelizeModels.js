const dependencies = {
  Sequelize: require('sequelize'),
  join: require('path').join,
  fs: require('fs')
}

const checkModelFiles = (extensionRegex) =>
  (file) => extensionRegex.test(file)

const importModel = (sequelize, modelDir, join) => (models, file) => {
  const model = sequelize.import(join(modelDir, file))

  return Object.assign(models, { [model.name]: model })
}

const associateModels = (models) => (modelName) => {
  if ('associate' in models[modelName]) {
    models[modelName].associate(models)
  }
}

const readModels = (sequelize, fileConfig, injection) => {
  const { join, fs } = Object.assign({}, dependencies, injection)

  const extensionRegex = fileConfig.extensionRegex || /.js$/
  const modelDir = fileConfig.modelDir

  const models = fs
    .readdirSync(modelDir)
    .filter(checkModelFiles(extensionRegex))
    .reduce(importModel(sequelize, modelDir, join), {})

  Object.keys(models).forEach(associateModels(models))

  return models
}

const configure = (configuration, injection) => {
  const { Sequelize } = Object.assign({}, dependencies, injection)

  const databaseConfig = configuration.database

  const sequelize = new Sequelize(
    databaseConfig.database,
    databaseConfig.username,
    databaseConfig.password,
    databaseConfig
  )

  const fileConfig = configuration.files

  const models = readModels(sequelize, fileConfig, injection)

  Object.assign(sequelizeModels, models, { sequelize })
}

const sequelizeModels = {
  configure
}

module.exports = sequelizeModels
