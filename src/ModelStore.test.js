const { expect } = require('chai')

const ModelStore = require('./ModelStore')

describe('ModelStore', () => {
  it('stores model on constructor', () => {
    const models = {
      someModel: 'some model'
    }

    const store = new ModelStore(models)

    expect(store).to.have.property('someModel')
  })

  describe('#init', () => {
    it('stores models successfully', () => {
      const models = {
        someModel: 'some model'
      }

      const store = new ModelStore()

      store.init(models)

      expect(store).to.have.property('someModel')
    })
  })
})
