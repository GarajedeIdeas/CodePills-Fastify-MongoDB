import { FastifyInstance } from 'fastify'
const FastifyEnv = require('fastify-env')
import DotEnv from 'dotenv'
import fp from 'fastify-plugin'

DotEnv.config()
const schema = {
    type: 'object',
    required: ['Port', 'Environment', 'JWTSecret'],
    properties: {
        Port: {
            type: 'string',
            default: 3005,
        },
        Environment: {
            type: 'string',
            default: 'development',
        },
        JWTSecret: {
            type: 'string',
            default: '',
        },
        MongoUri: {
            type: 'string',
            default: '',
        },
        GoogleKey: {
            type: 'string',
            default: '',
        },
    },
}

const options = {
    confKey: 'config',
    schema: schema,
    data: {
        Port: process.env.PORT,
        Environment: process.env.ENVIRONMENT,
        JWTSecret: process.env.JWT_SECRET,
        StripeSecret: process.env.STRIPE_SECRET,
        MongoUri: process.env.MONGO_URI,
        GoogleKey: process.env.GOOGLE_API_KEY
    },
}

declare module 'fastify' {
    interface FastifyInstance {
        config: Config
    }
    interface FastifyRequest {
        config: Config
    }
}

interface Config {
    Port: string
    Environment: string
    JWTSecret: string
    StripeSecret: string
    MongoUri: string
    GoogleKey: string
    ConfigApp: {
        deliveryPrice: number
        radius: number
        deliverySupplement: number
        minPrice: number
    }
}

export async function initConfig(fastify: FastifyInstance): Promise<void> {
    fastify.register(FastifyEnv, options)
    fastify.decorateRequest('config', null)
    fastify.addHook('onRequest', async (req) => {
        const data = options.data as Config
        req.config = data 
    })
}

export default fp(initConfig, { name: 'fastify-env' })
