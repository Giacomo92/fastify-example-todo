'use strict'

const schemas = require('../schemas/todo')

module.exports = async function (fastify, opts) {
  fastify.get('/', { schema: schemas.getAll }, function (request, reply) {
    const limit = parseInt(request.query.limit) || 0
    const offset = parseInt(request.query.offset) || 0

    return this.mongo.db.collection('todo').find()
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .toArray()
  })

  fastify.get('/:name', async function (request, reply) {
    const item = await this.mongo.db
      .collection('todo')
      .findOne({ name: request.params.name })

    if (item == null) {
      return reply.callNotFound()
    }

    return item
  })

  fastify.post('/', { schema: schemas.insertOne }, async function (request, reply) {
    return this.mongo.db
      .collection('todo')
      .insertOne(Object.assign(request.body, { timestamp: this.timestamp(), done: false }))
  })

  fastify.put('/:name', { schema: schemas.updateOne }, async function (request, reply) {
    return this.mongo.db
      .collection('todo')
      .findOneAndUpdate({ name: request.params.name }, { $set: { done: request.body.done } })
  })

  fastify.delete('/:name', { schema: schemas.deleteOne }, async function (request, reply) {
    return this.mongo.db
      .collection('todo')
      .deleteOne({ name: request.params.name })
  })

  fastify.get('/error', async function (request, reply) {
    throw new Error('boom')
  })
}

module.exports.autoPrefix = '/todo'
