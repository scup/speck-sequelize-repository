class ModelStore {
  constructor (models = {}) {
    this.init = this.init.bind(this)

    this.init(models)
  }

  init (models) {
    Object.assign(this, models, { init: this.init })
  }
}

module.exports = ModelStore
