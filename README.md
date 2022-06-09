# Webinar Youtube
En este vídeo veremos cómo funcionan distintos elementos como los Middleswares, plugins o el ciclo de vida en Fastify a través de varios ejemplos.

## Curso completo
[AQUÍ](https://www.youtube.com/watch?v=UrJENsmU1vw)

# README

MVP Back end code for Vizzio working to deliver into medium size population

## Local set up

-   Files:
    You will need a .env to start the server. You can simply copy the provided .env.local
    Also, changes on .env file will override the .env.local configuration inside makefile.

-   Local development
    You need to install [docker](https://www.docker.com/) in your computer.
    -- Run `npm i` to tell visual studio your dependencies, types and other npm stuff.
    -- Run `make up logs` to start de server and see server logs.
    -- You can inspect the server docker container with `make attach`.
    -- At now, for changes in node dependencies, you need to restart the server with `make restart logs`.
    -- To shutdown the server use `make down`.
    -- `make allLogs` will see you logs for all actives applications.

## Developing

This service is based in [fastify](https://www.fastify.io/). Please, check the documentation to understand how to contribute on it.

### Authorization

JWT auth strategies are out-the-box. Please see the [status controller](./src/service/status/controller/status.ts) to figure out these strategies.
If you need your own auth strategy, please read the [fastify-auth documentation](https://github.com/fastify/fastify-auth) and implement it in our custom [auth plugin](./src/plugin/auth.ts)

### Sending status codes

Please, read carefully the [fastify documentation](https://www.fastify.io/docs), specially the [managing errors parts](https://www.fastify.io/docs/latest/Reference/Hooks/#manage-errors-from-a-hook). We are using the [fastify-sesible](https://github.com/fastify/fastify-sensible) plugin to send standard error codes. A working example of this can be find in the [auth plugin](./src/plugin/auth.ts)
