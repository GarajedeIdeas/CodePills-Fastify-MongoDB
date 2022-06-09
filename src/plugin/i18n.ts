import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import i18next from 'i18next'
import { TranslateFunction } from '../interface/i18n'
import Backend from 'i18next-fs-backend'
import esTranslation from '../locales/es/translation.json'

function translate(key: string, counter?: number): string {
    if (counter == undefined) return i18next.t(key)

    let linguisticNumber = 'plural'
    if (counter === 1) linguisticNumber = 'singular'

    return i18next.t(`${key}.${linguisticNumber}`)
}

async function init(fastify: FastifyInstance): Promise<void> {
    i18next.use(Backend).init({
        resources: {
            es: {
                translation: esTranslation,
            },
        },
        fallbackLng: 'es',
        preload: ['es', 'en'],
        saveMissing: true,
    })
    fastify.decorateRequest('tr', null)
    fastify.addHook('onRequest', async (req) => {
        req.tr = translate
    })
}

declare module 'fastify' {
    interface FastifyRequest {
        tr: TranslateFunction
    }
}

export default fp(init, { name: 'fastify-i18n' })
