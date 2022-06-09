import { FastifyReply, FastifyRequest } from "fastify";
import { SongSchema } from "../../../plugin/db/models/song/interface";

export class SongController {
    public static storeSong = async (
        request: FastifyRequest,
        reply: FastifyReply
      ): Promise<void> => {
        const song = request.body as SongSchema
        try {
          const newSong = new request.songModel(song)
          const savedSong = await newSong.save()
          reply.send(savedSong)
        } catch (e) {
            reply.status(500).send(5)
        }
      };
}