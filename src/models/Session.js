import mongoose from 'mongoose';
import MessageSchema from './Message.js';

const SessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    unique: true,
    required: true,
  },
  userId:{
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  messages: [MessageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '24h', // Expira após 24 horas (opcional)
  },
});

const Session = mongoose.model('Session', SessionSchema);

export default Session;
