const dependencies = {
  modelStoreFactory: require('./ModelStoreFactory'),
  console
}

module.exports = async function initialize (configuration, injection) {
  const { modelStoreFactory, console } = Object.assign({}, dependencies, injection)

  const modelStore = modelStoreFactory.create(configuration, injection)

  if (configuration.skipConnection) { return modelStore }

  try {
    await modelStore.sequelize.validate()
    const { config } = modelStore.sequelize
    console.log(`Connected to database ${config.database} on ${config.host}:${config.port}`)
    return modelStore
  } catch (error) {
    console.log('Could not connect to database', error.message)
    throw error
  }
}
