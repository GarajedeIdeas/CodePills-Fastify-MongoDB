import { FastifyReply, FastifyRequest } from "fastify";
import { UserSchema } from "../../../plugin/db/models/user/interface";
import { genSalt, hash, compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { Document } from "mongoose";

export class UserController {
  public static me = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const user = await request.userModel.findById(request.loggedUser.id);

      reply.status(200).send(user);
    } catch (e: unknown) {
      reply.status(503).send(e);
    }
  };

  public static updateUser = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const newUser = request.body as UserSchema
      const user = await request.userModel.findByIdAndUpdate(
        request.loggedUser.id,
        newUser
      );
      reply.status(200).send(user);
    } catch (e: unknown) {
      reply.status(503).send(e);
    }
  };

  public static updatePass = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      let { pass } = request.body as { pass: string };
      pass = await this.generatePassword(pass);
      const user = await request.userModel.findByIdAndUpdate(
        request.loggedUser.id,
        { pass }
      );
      reply.status(200).send(user);
    } catch (e: unknown) {
      reply.status(503).send(e);
    }
  };

  public static login = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { email, password, notificationId } = request.body as {
        email: string;
        password: string;
        notificationId: string;
      };
      const user = await request.userModel.findOne({ email });
      if (user) {
        const isUserLogged = await compare(password, user.pass);
        if (isUserLogged) {
            const jwt = UserController.generateJWToken(
              user,
              request.config.JWTSecret,
            );
            reply.status(200).send(jwt);
        } else throw new Error("Contraseña incorrecta");
      } else {
        throw new Error("E-mail no valido");
      }
    } catch (e: unknown) {
      reply.status(401).send(e);
    }
  };

  public static createUser = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const user = request.body as UserSchema;
      const userFromDBPromise = request.userModel.findOne({
        email: user.email,
      });
      const hashPromise = UserController.generatePassword(user.pass);
      const [userFromDB, hash] = await Promise.all([
        userFromDBPromise,
        hashPromise,
      ]);
      if (userFromDB)
        throw new Error(
          `El usuario con e-mail: ${user.email} ya está registrado`
        );

      user.pass = hash;
      const newUser = new request.userModel(user);
      const dbUser = await newUser.save();
      const jwt = UserController.generateJWToken(
        dbUser,
        request.config.JWTSecret,
      );
      reply.status(200).send(jwt);
    } catch (e: unknown) {
      reply.status(503).send(e);
    }
  };
  public static logOut = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { notification } = request.query as { notification: string }
      const { id } = request.loggedUser;
      const user = await request.userModel.findByIdAndUpdate(
        { _id: id },
        {
          $pull: {
            notification,
          },
        },
        { new: true }
      );
      reply.status(200).send(user);
    } catch(e) {
      reply.status(503).send(e);
    }
  };
  public static async generatePassword(
    plainTextPassword: string
  ): Promise<string> {
    const SALTROUNDS = 10;
    const salt = await genSalt(SALTROUNDS);
    const password = await hash(plainTextPassword, salt);
    return password;
  }

  private static generateJWToken(
    user: UserSchema & Document<any, any, UserSchema>,
    JWTSecret: string,
  ): string {
    const jwt = sign(
      {
        email: user.email,
        name: user.name,
        id: user._id,
      },
      JWTSecret,
      { expiresIn: "30d" }
    );
    return jwt;
  }
}
