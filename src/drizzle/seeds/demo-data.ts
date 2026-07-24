/**
 * The people and relationships used by the demo/development/e2e database.
 *
 * Keep this file focused on the contents of the demo world. The seed module
 * is responsible for translating these records into database writes.
 */
export const demoSeedData = {
  userPassword: 'password',
  startsAt: '2026-01-01T00:00:00.000Z',

  people: [
    {
      key: 'mk-t1',
      email: 'demo-mk-t1-1@example.com',
      name: 'MK T1 Demo 1',
      status: 'active',
      choirId: 'mk',
      sectionId: 'mk-t1',
    },
    {
      key: 'mk-t2',
      email: 'demo-mk-t2-2@example.com',
      name: 'MK T2 Demo 2',
      status: 'active',
      choirId: 'mk',
      sectionId: 'mk-t2',
    },
    {
      key: 'mk-b1',
      email: 'demo-mk-b1-3@example.com',
      name: 'MK B1 Demo 3',
      status: 'active',
      choirId: 'mk',
      sectionId: 'mk-b1',
    },
    {
      key: 'mk-b2',
      email: 'demo-mk-b2-4@example.com',
      name: 'MK B2 Demo 4',
      status: 'active',
      choirId: 'mk',
      sectionId: 'mk-b2',
    },
    {
      key: 'kk-s1',
      email: 'demo-kk-s1-5@example.com',
      name: 'KK S1 Demo 5',
      status: 'active',
      choirId: 'kk',
      sectionId: 'kk-s1',
    },
    {
      key: 'kk-s2',
      email: 'demo-kk-s2-6@example.com',
      name: 'KK S2 Demo 6',
      status: 'active',
      choirId: 'kk',
      sectionId: 'kk-s2',
    },
    {
      key: 'kk-a1',
      email: 'demo-kk-a1-7@example.com',
      name: 'KK A1 Demo 7',
      status: 'active',
      choirId: 'kk',
      sectionId: 'kk-a1',
    },
    {
      key: 'kk-a2',
      email: 'demo-kk-a2-8@example.com',
      name: 'KK A2 Demo 8',
      status: 'active',
      choirId: 'kk',
      sectionId: 'kk-a2',
    },
    {
      key: 'kk-t1',
      email: 'demo-kk-t1-9@example.com',
      name: 'KK T1 Demo 9',
      status: 'active',
      choirId: 'kk',
      sectionId: 'kk-t1',
    },
    {
      key: 'kk-t2',
      email: 'demo-kk-t2-10@example.com',
      name: 'KK T2 Demo 10',
      status: 'active',
      choirId: 'kk',
      sectionId: 'kk-t2',
    },
    {
      key: 'kk-b1',
      email: 'demo-kk-b1-11@example.com',
      name: 'KK B1 Demo 11',
      status: 'active',
      choirId: 'kk',
      sectionId: 'kk-b1',
    },
    {
      key: 'kk-b2',
      email: 'demo-kk-b2-12@example.com',
      name: 'KK B2 Demo 12',
      status: 'active',
      choirId: 'kk',
      sectionId: 'kk-b2',
    },
    {
      key: 'dk-s1',
      email: 'demo-dk-s1-13@example.com',
      name: 'DK S1 Demo 13',
      status: 'active',
      choirId: 'dk',
      sectionId: 'dk-s1',
    },
    {
      key: 'dk-s2',
      email: 'demo-dk-s2-14@example.com',
      name: 'DK S2 Demo 14',
      status: 'active',
      choirId: 'dk',
      sectionId: 'dk-s2',
    },
    {
      key: 'dk-a1',
      email: 'demo-dk-a1-15@example.com',
      name: 'DK A1 Demo 15',
      status: 'active',
      choirId: 'dk',
      sectionId: 'dk-a1',
    },
    {
      key: 'dk-a2',
      email: 'demo-dk-a2-16@example.com',
      name: 'DK A2 Demo 16',
      status: 'former',
    },
  ],

  positionAssignments: [
    { positionId: 'president', personKey: 'mk-t1' },
    { positionId: 'master-of-parties', personKey: 'mk-t2' },
    { positionId: 'mk-conductor', personKey: 'mk-b1' },
    { positionId: 'kk-s-voice-parent', personKey: 'kk-s1' },
    { positionId: 'tour-treasurer', personKey: 'kk-s2' },
  ],

  groupMemberships: [{ id: 'demo-committee-membership', groupId: 'recruitment-committee', personKey: 'kk-a1' }],
} as const
