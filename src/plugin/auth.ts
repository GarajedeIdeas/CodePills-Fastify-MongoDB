import { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify'
import fastifyAuth from 'fastify-auth-deprecated'
import { DecodePayloadType } from 'fastify-jwt'
import fp from 'fastify-plugin'
import FastifyJWT from 'fastify-jwt'
import { HttpErrors, HttpError } from 'fastify-sensible-deprecated/lib/httpError'
export class AuthEngine {
    private static httpErrors: HttpErrors

    public static setHttpErrors(errors: HttpErrors): void {
        AuthEngine.httpErrors = errors
    }

    public allowAnonymous(request: FastifyRequest, reply: FastifyReply, done: (error?: Error) => void): void {
        done()
    }

    public async loggedUsers(request: FastifyRequest): Promise<void> {
        const loginError = await AuthEngine.loginRequester(request)
        if (!loginError) {
            return
        }

        throw loginError
    }

    private static loginRequester = async (request: FastifyRequest): Promise<HttpError | undefined> => {
        if (!request.headers.authorization) {
            return AuthEngine.httpErrors.unauthorized()
        }

        try {
            const IDToken = await request.jwtVerify()
            const token = request.headers.authorization.replace('Bearer ', '')
            request.loggedUser = new User(token, IDToken)
            return
        } catch (e: unknown) {
            return AuthEngine.httpErrors.unauthorized()
        }
    }

    public async withRoles(roles: string[]): Promise<(request: FastifyRequest) => Promise<void>> {
        return async (request): Promise<void> => {
            const loginError = await AuthEngine.loginRequester(request)
            if (!loginError) {
                if (request.loggedUser?.IAmOneOf(roles)) {
                    return
                }
                throw AuthEngine.httpErrors.forbidden()
            }
            throw AuthEngine.httpErrors.unauthorized()
        }
    }

    public static async init(fastify: FastifyInstance): Promise<void> {
        fastify.register(FastifyJWT, {
            secret: fastify.config.JWTSecret,
        })
        const userCredential = new User()
        fastify.register(fastifyAuth)
        AuthEngine.setHttpErrors(fastify.httpErrors)
        fastify.decorate('authEngine', new AuthEngine())
        fastify.decorateRequest('userCredential', null)
        fastify.addHook('onRequest', async (req) => {
            req.user = userCredential
        })
    }
}

export default fp(AuthEngine.init, { name: 'AuthEngine' })

export class User {
    private _jwt: string
    private IDToken?: JWTPayload

    private get role(): string {
        return this.IDToken?.role ?? ''
    }

    public get jwt(): string {
        return this._jwt
    }

    public get id(): string {
        if (!this.IDToken) {
            throw new Error(`Can't obtain id from empty user`)
        }
        return this.IDToken.id
    }

    public get stripeId(): string {
        if (!this.IDToken) {
            throw new Error(`Can't obtain stripeId from empty user`)
        }
        return this.IDToken.stripeId
    }

    public get notification(): string[] {
        if (!this.IDToken) {
            throw new Error(`Can't obtain NotificationId from empty user`)
        }
        return this.IDToken.notification
    }

    public get name(): string {
        if (!this.IDToken) {
            throw new Error(`Can't obtain name from empty user`)
        }
        return this.IDToken.name
    }

    public get email(): string {
        if (!this.IDToken) {
            throw new Error(`Can't obtain email from empty user`)
        }
        return this.IDToken.email
    }

    public constructor(jwt?: string, IDToken?: DecodePayloadType) {
        this._jwt = jwt || ''
        if (IDToken) {
            this.IDToken = IDToken as JWTPayload
        }
    }

    public IAm(role: string): boolean {
        if (!this.IDToken) {
            return false
        }
        try {
            return this.role == role
        } catch (e) {
            return false
        }
    }

    public IAmOneOf(roles: string[]): boolean {
        try {
            let isOneOf = false
            roles.forEach((rol) => {
                if (this.IAm(rol)) {
                    isOneOf = true
                    return
                }
            })
            return isOneOf
        } catch (e) {
            return false
        }
    }
}

type JWTPayload = {
    id: string
    stripeId: string
    notification: string[]
    role: string
    name: string
    email: string
}

declare module 'fastify' {
    export interface FastifyInstance {
        authEngine: AuthEngine
    }

    export interface FastifyRequest {
        loggedUser: User
    }
}
