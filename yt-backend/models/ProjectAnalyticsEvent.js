import mongoose from 'mongoose';
import { EVENT_TYPES } from '../utils/projectAnalytics.js';

const schema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  type: { type: String, enum: EVENT_TYPES, required: true },
  visitorId: { type: String, required: true },
  sessionId: { type: String, required: true },
  path: { type: String, required: true },
  target: { type: String, default: '' },
  source: { type: String, default: 'Direct' },
  createdAt: { type: Date, default: Date.now },
});
schema.index({ createdAt: 1, type: 1 });
export default mongoose.model('ProjectAnalyticsEvent', schema);
