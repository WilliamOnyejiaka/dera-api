import { Schema, model } from 'mongoose'

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  token: {
    type: String,
    required: true
  }
})

export default model('Token', tokenSchema)
