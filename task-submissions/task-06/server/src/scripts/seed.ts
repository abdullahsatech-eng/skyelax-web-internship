import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { loadConfig } from '../config/env';
import { ServiceRequestModel } from '../models/serviceRequestModel';
import type { RequestFields } from '../types/serviceRequest';

/** Fictional demonstration records. They contain no real people or organisations. */
const DEMO_REQUESTS: RequestFields[] = [
  { title: '[Demo] Printer jams on floor 2', description: 'The shared printer jams on every second page. Paper tray was already checked.', category: 'it', priority: 'medium', status: 'open', requesterName: 'Demo Requester 1', requesterEmail: 'demo.requester1@example.com' },
  { title: '[Demo] Meeting room projector shows no signal', description: 'Projector in meeting room B displays no signal from any laptop or HDMI cable.', category: 'it', priority: 'high', status: 'in-progress', requesterName: 'Demo Requester 2', requesterEmail: 'demo.requester2@example.com' },
  { title: '[Demo] Flickering light in corridor', description: 'The corridor light near the east stairs flickers and buzzes during the afternoon.', category: 'electrical', priority: 'low', status: 'open', requesterName: 'Demo Requester 3', requesterEmail: 'demo.requester3@example.com' },
  { title: '[Demo] Leaking tap in kitchenette', description: 'The cold tap in the kitchenette drips constantly and the sink cabinet is damp.', category: 'plumbing', priority: 'high', status: 'open', requesterName: 'Demo Requester 4', requesterEmail: 'demo.requester4@example.com' },
  { title: '[Demo] Power outage in server cupboard', description: 'Sockets in the server cupboard have no power. Equipment is running on battery.', category: 'electrical', priority: 'urgent', status: 'in-progress', requesterName: 'Demo Requester 5', requesterEmail: 'demo.requester5@example.com' },
  { title: '[Demo] Broken chair in training room', description: 'Two chairs in the training room have broken gas lifts and cannot be adjusted.', category: 'maintenance', priority: 'low', status: 'resolved', requesterName: 'Demo Requester 6', requesterEmail: 'demo.requester6@example.com' },
  { title: '[Demo] Wi-Fi drops in east wing', description: 'Wireless connection drops every few minutes in the east wing offices.', category: 'it', priority: 'medium', status: 'resolved', requesterName: 'Demo Requester 7', requesterEmail: 'demo.requester7@example.com' },
  { title: '[Demo] Door closer needs adjustment', description: 'The main entrance door closes too slowly and does not latch properly.', category: 'maintenance', priority: 'medium', status: 'closed', requesterName: 'Demo Requester 8', requesterEmail: 'demo.requester8@example.com' },
];

async function seed(): Promise<void> {
  const config = loadConfig();
  await connectDatabase(config.mongodbUri);

  const existing = await ServiceRequestModel.countDocuments();
  if (existing > 0 && !process.argv.includes('--force')) {
    console.log(`Collection already has ${existing} record(s). Nothing inserted. Use --force to add demo data anyway.`);
  } else {
    const inserted = await ServiceRequestModel.insertMany(DEMO_REQUESTS);
    console.log(`Inserted ${inserted.length} demo record(s).`);
  }
  await mongoose.disconnect();
}

seed().catch((error: unknown) => {
  console.error('Seeding failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
