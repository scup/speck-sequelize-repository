## Speck Sequelize Repository - Create repositories handle Sequelize models with [Speck](https://github.com/scup/speck).

[![Build Status](https://travis-ci.org/scup/speck-sequelize-repository.svg?branch=master)](https://travis-ci.org/scup/speck-sequelize-repository)

This package let you use Speck with repositories to handle Sequelize models.

* [Installing](#installing)
* [Examples](#examples)

### Installing
    $ npm install speck-sequelize-repository

### Examples

#### Sample Repository
```javascript
const { Repository } = require('speck-sequelize-repository')

const { MySequelizeModel } = require('./models')
const MyModelMap = require('./modelMaps/MyModelMap')

const MyModelRepository = {
  customQuery ({ someField }) {
    return this.findOneByCriterias({ someField })
  }
}

module.exports = Repository.for(MySequelizeModel, MyModelMap, MyModelRepository)

```

#### Sample Mapper

Creates a mapper like in [object-mapper](https://github.com/wankdanker/node-object-mapper):

```javascript
const { Mapper } = require('speck-sequelize-repository')

const map = {
  toEntity: {
    'someField': 'someField'
  },
  toDatabase: {
    'someField': 'someField'
  }
}

module.exports = new Mapper(Object, map)

```

#### Auto Mapper

Creates a Mapper without specifying manually the map fields:

```javascript
  const { AutoMapper } = require('speck-sequelize-repository')
  const mapper = new AutoMapper(someSpeckEntity)
```

The map fields will be automatically created from a speck entity. Note: entity relationships will have opinionated naming, example: `entity.relationship` will expect on database a `relationship` table with `relationshipId` field.

You can also **override** some of the automatically generated fields naming, or **exclude** entity properties from map on AutoMapper constructor:

```javascript
  const mapper = new AutoMapper(someSpeckEntity, {
     override: {
       entityField: 'otherFieldName',
       entityRelationshipField: 'otherTableName.otherFieldName'
     },
     exclude: ['someEntityProperty']
  )
```
