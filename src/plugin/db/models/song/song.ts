import { Schema, model } from 'mongoose';
import { SongSchema } from './interface'

const songSchema = new Schema<SongSchema>({
    title: {type: String, require: true},
    duration: {type: Number, require: true},
    rating: {type: Number },
})

const SongModel = model<SongSchema>('Song', songSchema);

export default SongModel