const dependencies = {
  objectMapper: require('object-mapper')
}

class BaseMap {
  constructor (Entity, map, injection) {
    const resolvedDependencies = Object.assign({}, dependencies, injection)

    Object.assign(
      this,
      resolvedDependencies,
      { Entity, map }
    )

    this.toEntity = this.toEntity.bind(this)
    this.toDatabase = this.toDatabase.bind(this)
    this.mapResults = this.mapResults.bind(this)
    this.createEntity = this.createEntity.bind(this)
  }

  createEntity (entityValues, useEntity) {
    return useEntity ? new this.Entity(entityValues) : entityValues
  }

  mapResults (results, mapType, useEntity) {
    if (!results) {
      return null
    }

    if (Array.isArray(results)) {
      return results.map((result) => this.mapResults(result, mapType, useEntity))
    }

    const mappedObject = this.objectMapper(results, this.map[mapType])

    return this.createEntity(mappedObject, useEntity)
  }

  toEntity (results, injection) {
    return this.mapResults(results, 'toEntity', true)
  }

  toDatabase (results, injection) {
    return this.mapResults(results, 'toDatabase')
  }
}

module.exports = BaseMap
