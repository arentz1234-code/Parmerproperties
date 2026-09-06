import { Message } from '@/types'

// Thread IDs group messages into conversations
// Sender/receiver IDs reference user IDs (user_manager_001, user_tenant_00X)

export let messages: Message[] = [
  // ── Thread 1: Maintenance follow-up (manager → Sarah Mitchell) ──────────────
  {
    id: 'msg_001',
    threadId: 'thread_001',
    senderId: 'user_manager_001',
    receiverIds: ['user_tenant_001'],
    subject: 'Dishwasher repair scheduled',
    body: 'Hi Sarah, just wanted to let you know we\'ve scheduled Eagle Appliance Repair to come take a look at your dishwasher on Sunday, September 7th between 1-3 PM. You should receive a confirmation call the day before. Please let me know if that time doesn\'t work for you.',
    createdAt: new Date('2026-09-04T10:30:00'),
  },
  {
    id: 'msg_002',
    threadId: 'thread_001',
    senderId: 'user_tenant_001',
    receiverIds: ['user_manager_001'],
    subject: 'Re: Dishwasher repair scheduled',
    body: 'Thank you so much! Sunday works perfectly. I\'ll make sure to be home. Should I clear out the cabinet under the sink for easier access?',
    readAt: new Date('2026-09-04T11:05:00'),
    createdAt: new Date('2026-09-04T10:55:00'),
  },
  {
    id: 'msg_003',
    threadId: 'thread_001',
    senderId: 'user_manager_001',
    receiverIds: ['user_tenant_001'],
    body: 'Great question! Yes, if you could clear that cabinet out that would be really helpful for the technician. See you Sunday!',
    createdAt: new Date('2026-09-04T11:20:00'),
  },

  // ── Thread 2: Rent payment reminder (manager → Marcus Williams) ─────────────
  {
    id: 'msg_004',
    threadId: 'thread_002',
    senderId: 'user_manager_001',
    receiverIds: ['user_tenant_006'],
    subject: 'September rent — payment reminder',
    body: 'Hi Marcus, I\'m reaching out because we haven\'t received your September rent payment yet. As a reminder, rent was due on September 1st. Your balance of $3,800 plus a late fee of $190 is now due. Please remit payment as soon as possible to avoid further action. Feel free to call me if you need to discuss payment options.',
    createdAt: new Date('2026-09-05T09:00:00'),
  },

  // ── Thread 3: Fall 2027 lease inquiry (manager → prospective tenant) ─────────
  {
    id: 'msg_005',
    threadId: 'thread_003',
    senderId: 'user_manager_001',
    receiverIds: ['user_tenant_007'],
    subject: 'Your tour request — Richland Village III',
    body: 'Hi Olivia, thanks for your interest in Richland Village III! We\'d love to show you around. We have availability for tours on Wednesday Sept 9th or Thursday Sept 10th — any preference on time? We have the 4BD/3.5BA units starting at $2,700/month for Fall 2027.',
    createdAt: new Date('2026-09-03T14:15:00'),
  },
  {
    id: 'msg_006',
    threadId: 'thread_003',
    senderId: 'user_tenant_007',
    receiverIds: ['user_manager_001'],
    subject: 'Re: Your tour request — Richland Village III',
    body: 'Hi Andrew! Wednesday at 3 PM would be perfect for me and my two roommates. We\'re very interested in one of the 4-bedroom units. See you then!',
    readAt: new Date('2026-09-03T15:30:00'),
    createdAt: new Date('2026-09-03T15:10:00'),
  },

  // ── Thread 4: Notice to vacate acknowledgment ────────────────────────────────
  {
    id: 'msg_007',
    threadId: 'thread_004',
    senderId: 'user_tenant_002',
    receiverIds: ['user_manager_001'],
    subject: 'Notice to vacate — Unit 102',
    body: 'Hi Andrew, I\'m writing to formally give 60-day notice that I will be vacating unit 102 at 538 Richland Road at the end of September. I\'ve really enjoyed living here. Could you let me know the move-out inspection process and when I might expect my deposit back?',
    createdAt: new Date('2026-08-01T10:00:00'),
  },
  {
    id: 'msg_008',
    threadId: 'thread_004',
    senderId: 'user_manager_001',
    receiverIds: ['user_tenant_002'],
    subject: 'Re: Notice to vacate — Unit 102',
    body: 'Hi Jordan, thank you for giving us proper notice — we appreciate it! We\'ll schedule a move-out walkthrough for September 30th. Your deposit of $1,550 will be returned within 35 days of move-out, minus any applicable charges. I\'ll send over the move-out checklist this week. Best of luck in your next place!',
    readAt: new Date('2026-08-01T14:22:00'),
    createdAt: new Date('2026-08-01T13:45:00'),
  },

  // ── Thread 5: Welcome message to new tenants ─────────────────────────────────
  {
    id: 'msg_009',
    threadId: 'thread_005',
    senderId: 'user_manager_001',
    receiverIds: ['user_tenant_001', 'user_tenant_003', 'user_tenant_004', 'user_tenant_005'],
    subject: 'Welcome to Parmer Properties — Fall 2026!',
    body: 'Welcome to your new home! We\'re thrilled to have you as part of the Parmer Properties community. A few quick reminders:\n\n• Rent is due on the 1st of each month. Online payment is available through the tenant portal.\n• For maintenance requests, please submit through the portal or email us directly.\n• Trash pickup is Monday and Thursday.\n• Please review the community guidelines attached to your lease.\n\nDon\'t hesitate to reach out if you have any questions. We want your experience to be exceptional!',
    createdAt: new Date('2026-08-01T08:00:00'),
  },

  // ── Thread 6: HVAC urgent follow-up ─────────────────────────────────────────
  {
    id: 'msg_010',
    threadId: 'thread_006',
    senderId: 'user_tenant_003',
    receiverIds: ['user_manager_001'],
    subject: 'URGENT — AC still not working, 81 degrees inside',
    body: 'Andrew, I submitted a maintenance request yesterday about the AC but wanted to reach out directly because it\'s getting uncomfortable. My roommate has asthma and 81°F is really concerning. Is there anything we can do today? Could we get portable AC units in the meantime?',
    createdAt: new Date('2026-09-05T08:30:00'),
  },
  {
    id: 'msg_011',
    threadId: 'thread_006',
    senderId: 'user_manager_001',
    receiverIds: ['user_tenant_003'],
    subject: 'Re: URGENT — AC still not working, 81 degrees inside',
    body: 'Hi Madison, I\'m so sorry — I understand how uncomfortable that is, especially with a roommate who has asthma. Capital HVAC is scheduled for tomorrow (Sept 6) at 10 AM. In the meantime, I\'ll drop off two portable window AC units by 5 PM today. Please call me directly at (334) 555-0101 if anything changes.',
    readAt: new Date('2026-09-05T09:15:00'),
    createdAt: new Date('2026-09-05T09:00:00'),
  },
]
