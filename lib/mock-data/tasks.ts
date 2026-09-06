import { Task, MaintenancePriority } from '@/types'

export let tasks: Task[] = [
  {
    id: 'task_001',
    title: 'Follow up on Marcus Williams overdue rent — B-01',
    description:
      'September rent is overdue for unit B-01 (Marcus Williams). Call or text to confirm payment plan. If no response by Sept 10, issue formal 7-day notice to pay or vacate.',
    assignedTo: 'user_manager_001',
    dueDate: new Date('2026-09-10'),
    priority: MaintenancePriority.HIGH,
    status: 'IN_PROGRESS',
    createdAt: new Date('2026-09-05T09:00:00'),
  },
  {
    id: 'task_002',
    title: 'Schedule move-out inspection for unit 102 (Jordan Hayes)',
    description:
      'Tenant Jordan Hayes is vacating unit 102 at end of September. Schedule move-out inspection for Sept 30th and send move-out checklist via email.',
    assignedTo: 'user_manager_001',
    dueDate: new Date('2026-09-15'),
    priority: MaintenancePriority.MEDIUM,
    status: 'TODO',
    createdAt: new Date('2026-08-15T10:00:00'),
  },
  {
    id: 'task_003',
    title: 'Prepare Fall 2027 marketing materials for RV3',
    description:
      'Create updated floor plan brochures and photography schedule for Richland Village III pre-leasing campaign. Coordinate with photographer for interior shots of model units R3-4A and R3-CA.',
    assignedTo: 'user_manager_001',
    dueDate: new Date('2026-09-20'),
    priority: MaintenancePriority.MEDIUM,
    status: 'IN_PROGRESS',
    createdAt: new Date('2026-08-25T14:00:00'),
  },
  {
    id: 'task_004',
    title: 'Review and respond to 2 pending applications',
    description:
      'Two applications (app_001 — Brendan O\'Sullivan for unit 303, app_002 — Taylor Whitfield for B-06) are pending review. Run background checks and make decisions.',
    assignedTo: 'user_manager_001',
    dueDate: new Date('2026-09-08'),
    priority: MaintenancePriority.HIGH,
    status: 'TODO',
    createdAt: new Date('2026-09-04T09:00:00'),
  },
  {
    id: 'task_005',
    title: 'Coordinate vendor access for AC repair at unit 201',
    description:
      'Capital HVAC is arriving Sept 6 at 10 AM for the HVAC repair at unit 201 (Windsor). Confirm access with tenant Madison Carter and ensure vendor has gate code.',
    assignedTo: 'user_manager_001',
    dueDate: new Date('2026-09-06'),
    priority: MaintenancePriority.HIGH,
    status: 'TODO',
    createdAt: new Date('2026-09-05T08:00:00'),
  },
  {
    id: 'task_006',
    title: 'Q3 financial report — prepare for owner review',
    description:
      'Compile Q3 (July–September 2026) income, expenses, and occupancy report for James Parmer. Include rent roll, maintenance costs, and vacancy summary across all four properties.',
    assignedTo: 'user_manager_001',
    dueDate: new Date('2026-10-05'),
    priority: MaintenancePriority.MEDIUM,
    status: 'TODO',
    createdAt: new Date('2026-09-01T09:00:00'),
  },
]
