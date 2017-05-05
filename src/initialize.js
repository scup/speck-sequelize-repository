const dependencies = {
  modelStoreFactory: require('./ModelStoreFactory'),
  console: console
}

module.exports = function initialize (configuration, injection) {
  const { modelStoreFactory, console } = Object.assign({}, dependencies, injection)

  const modelStore = modelStoreFactory.create(configuration, injection)

  if (configuration.skipConnection) {
    return Promise.resolve(modelStore)
  }

  return modelStore.sequelize
          .sync()
          .then(sequelize => {
            const { config } = sequelize
            console.log(`Connected to database ${config.database} on ${config.host}:${config.port}`)
            return modelStore
          })
          .catch(reason => {
            console.log(`Could not connect to database`, reason)
            return Promise.reject(reason)
          })
}
