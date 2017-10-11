const BaseMap = require('./BaseMap')

class AutoMapper {
  addToMapper (map, key, isObject = false, toDatabase) {
    map.toEntity[isObject ? `${key}Id` : key] = isObject ? `${key}.${key}Id` : key
    map.toDatabase[toDatabase || (isObject ? `${key}.${key}Id` : key)] = isObject ? `${key}Id` : key
  }

  createMapFromEntity (entity, { override = {}, exclude = [] } = {}) {
    const { SCHEMA } = entity
    const map = { toEntity: {}, toDatabase: {} }

    Object.keys(SCHEMA).forEach((key) => {
      if (exclude.includes(key)) return

      if (Object.keys(override).includes(key)) {
        this.addToMapper(map, key, true, override[key])
        return
      }

      if (typeof SCHEMA[key] === 'object' && SCHEMA[key].type.name !== 'Date') {
        this.addToMapper(map, key, true)
      } else {
        this.addToMapper(map, key)
      }
    })

    return new BaseMap(entity, map)
  }
}

module.exports = AutoMapper
