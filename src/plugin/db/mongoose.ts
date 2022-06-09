import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import mongoose from 'mongoose'
import { UserSchema } from './models/user/interface'
import UserModel from './models/user/user'
import { SongSchema } from './models/song/interface'
import SongModel from './models/song/song'

export default fp(async (fastify: FastifyInstance) => {
    await mongoose.connect(fastify.config.MongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    mongoose.Promise = Promise
    fastify.decorate('mongoose', mongoose)
    fastify.addHook('onRequest', async (req) => {
        req.userModel = UserModel
        req.songModel = SongModel
    })
})

declare module 'fastify' {
    export interface FastifyInstance {
        mongoose: mongoose.Mongoose
    }
    export interface FastifyRequest {
        userModel: mongoose.Model<UserSchema, {}, {}>
        songModel: mongoose.Model<SongSchema, {}, {}>
    }
}
