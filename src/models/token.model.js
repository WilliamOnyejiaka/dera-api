import { Schema, model } from 'mongoose'

const expireTime = 60 * 60; // 1 hour in seconds

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: { type: Date, default: () => new Date(Date.now() + expireTime * 1000) }
});

tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model('Token', tokenSchema)
