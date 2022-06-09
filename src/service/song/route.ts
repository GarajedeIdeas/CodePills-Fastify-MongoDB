import { FastifyInstance } from "fastify";
import { SongController } from './'

export class SongRouter {
  public static routes = async (fastify: FastifyInstance): Promise<void> => {
    fastify.post("/song", SongController.storeSong);
  };
}