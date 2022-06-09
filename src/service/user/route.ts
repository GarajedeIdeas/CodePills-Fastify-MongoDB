import { FastifyInstance } from "fastify";
import { UserController } from ".";

export class UserRouter {
  public static routes = async (fastify: FastifyInstance): Promise<void> => {
    fastify.post("/user/login", UserController.login);
    fastify.post("/user/register", UserController.createUser);
    fastify.get("/user", { preValidation: fastify.auth([fastify.authEngine.loggedUsers]) }, UserController.me);
    fastify.put("/user", { preValidation: fastify.auth([fastify.authEngine.loggedUsers]) }, UserController.updateUser)
    fastify.put("/user/password", { preValidation: fastify.auth([fastify.authEngine.loggedUsers]) }, UserController.updatePass)
    fastify.delete("/user/logout", { preValidation: fastify.auth([fastify.authEngine.loggedUsers]) }, UserController.logOut)
  };
}
