/**
 * The complete, code-controlled Permanent Organization Topology of CSK.
 *
 * This is domain data, not seed input. Relationship records store these
 * identifiers, while runtime readers resolve their meaning from this module.
 * Omitted lifecycle status means active; retired entities must say so explicitly.
 */

const MK = { id: 'mk', name: 'Manskören', shortName: 'MK' } as const
const KK = { id: 'kk', name: 'Kammarkören', shortName: 'KK' } as const
const DK = { id: 'dk', name: 'Damkören', shortName: 'DK' } as const

const choirs = [MK, KK, DK] as const

const MK_T1 = { id: 'mk-t1', choirId: MK.id, name: 'T1', allowedVoiceTypes: ['T1'] } as const
const MK_T2 = { id: 'mk-t2', choirId: MK.id, name: 'T2', allowedVoiceTypes: ['T2'] } as const
const MK_B1 = { id: 'mk-b1', choirId: MK.id, name: 'B1', allowedVoiceTypes: ['B1'] } as const
const MK_B2 = { id: 'mk-b2', choirId: MK.id, name: 'B2', allowedVoiceTypes: ['B2'] } as const
const KK_S = { id: 'kk-s', choirId: KK.id, name: 'S', allowedVoiceTypes: ['S1', 'S2'] } as const
const KK_A = { id: 'kk-a', choirId: KK.id, name: 'A', allowedVoiceTypes: ['A1', 'A2'] } as const
const KK_T = { id: 'kk-t', choirId: KK.id, name: 'T', allowedVoiceTypes: ['T1', 'T2'] } as const
const KK_B = { id: 'kk-b', choirId: KK.id, name: 'B', allowedVoiceTypes: ['B1', 'B2'] } as const
const DK_S1 = { id: 'dk-s1', choirId: DK.id, name: 'S1', allowedVoiceTypes: ['S1'] } as const
const DK_S2 = { id: 'dk-s2', choirId: DK.id, name: 'S2', allowedVoiceTypes: ['S2'] } as const
const DK_A1 = { id: 'dk-a1', choirId: DK.id, name: 'A1', allowedVoiceTypes: ['A1'] } as const
const DK_A2 = { id: 'dk-a2', choirId: DK.id, name: 'A2', allowedVoiceTypes: ['A2'] } as const

const sections = [MK_T1, MK_T2, MK_B1, MK_B2, KK_S, KK_A, KK_T, KK_B, DK_S1, DK_S2, DK_A1, DK_A2] as const

const BOARD = { id: 'board', kind: 'board', name: 'Board', scope: { type: 'csk' } } as const
const CONCERT_MASTERY = {
  id: 'concert-mastery',
  kind: 'committee',
  name: 'Concert Mastery',
  scope: { type: 'csk' },
} as const
const GIG_MASTERY = {
  id: 'gig-mastery',
  kind: 'committee',
  name: 'Gig Mastery',
  scope: { type: 'csk' },
} as const
const PARTY_MASTERY = {
  id: 'party-mastery',
  kind: 'committee',
  name: 'Party Mastery',
  scope: { type: 'csk' },
} as const
const WEB_MASTERY = { id: 'web-mastery', kind: 'committee', name: 'Web Mastery', scope: { type: 'csk' } } as const
const TOUR_COMMITTEE = {
  id: 'tour-committee',
  kind: 'committee',
  name: 'Tour Committee',
  scope: { type: 'csk' },
} as const
const RECRUITMENT_COMMITTEE = {
  id: 'recruitment-committee',
  kind: 'committee',
  name: 'Recruitment Committee',
  scope: { type: 'csk' },
} as const
const UTANTILL_COMMITTEE = {
  id: 'utantill-committee',
  kind: 'committee',
  name: 'Utantill Committee',
  scope: { type: 'csk' },
} as const
const MK_CONCERT = {
  id: 'mk-concert',
  kind: 'committee',
  name: 'Concert Group',
  scope: { type: 'choir', choirId: MK.id },
} as const
const MK_PARTY = {
  id: 'mk-party',
  kind: 'committee',
  name: 'Party Group',
  scope: { type: 'choir', choirId: MK.id },
} as const
const MK_RODD = {
  id: 'mk-rodd',
  kind: 'committee',
  name: 'Rodd Group',
  scope: { type: 'choir', choirId: MK.id },
} as const
const KK_CONCERT = {
  id: 'kk-concert',
  kind: 'committee',
  name: 'Concert Group',
  scope: { type: 'choir', choirId: KK.id },
} as const
const KK_PARTY = {
  id: 'kk-party',
  kind: 'committee',
  name: 'Party Group',
  scope: { type: 'choir', choirId: KK.id },
} as const
const KK_RODD = {
  id: 'kk-rodd',
  kind: 'committee',
  name: 'Rodd Group',
  scope: { type: 'choir', choirId: KK.id },
} as const
const DK_CONCERT = {
  id: 'dk-concert',
  kind: 'committee',
  name: 'Concert Group',
  scope: { type: 'choir', choirId: DK.id },
} as const
const DK_PARTY = {
  id: 'dk-party',
  kind: 'committee',
  name: 'Party Group',
  scope: { type: 'choir', choirId: DK.id },
} as const
const DK_RODD = {
  id: 'dk-rodd',
  kind: 'committee',
  name: 'Rodd Group',
  scope: { type: 'choir', choirId: DK.id },
} as const

const groups = [
  BOARD,
  CONCERT_MASTERY,
  GIG_MASTERY,
  PARTY_MASTERY,
  WEB_MASTERY,
  TOUR_COMMITTEE,
  RECRUITMENT_COMMITTEE,
  UTANTILL_COMMITTEE,
  MK_CONCERT,
  MK_PARTY,
  MK_RODD,
  KK_CONCERT,
  KK_PARTY,
  KK_RODD,
  DK_CONCERT,
  DK_PARTY,
  DK_RODD,
] as const

const PRESIDENT = { id: 'president', name: 'President', scopes: [{ type: 'group', groupId: BOARD.id }] } as const
const VICE_PRESIDENT = {
  id: 'vice-president',
  name: 'Vice President',
  scopes: [
    { type: 'group', groupId: BOARD.id },
    { type: 'group', groupId: RECRUITMENT_COMMITTEE.id },
  ],
} as const
const TREASURER = { id: 'treasurer', name: 'Treasurer', scopes: [{ type: 'group', groupId: BOARD.id }] } as const
const SECRETARY = { id: 'secretary', name: 'Secretary', scopes: [{ type: 'group', groupId: BOARD.id }] } as const
const MASTER_OF_PARTIES = {
  id: 'master-of-parties',
  name: 'Master of Parties',
  scopes: [
    { type: 'group', groupId: BOARD.id },
    { type: 'group', groupId: PARTY_MASTERY.id },
  ],
} as const
const MASTER_OF_GIGS = {
  id: 'master-of-gigs',
  name: 'Master of Gigs',
  scopes: [
    { type: 'group', groupId: BOARD.id },
    { type: 'group', groupId: GIG_MASTERY.id },
  ],
} as const
const MASTER_OF_CONCERTS = {
  id: 'master-of-concerts',
  name: '1st Master of Concerts',
  scopes: [
    { type: 'group', groupId: BOARD.id },
    { type: 'group', groupId: CONCERT_MASTERY.id },
  ],
} as const
const MASTER_OF_PR = {
  id: 'master-of-pr',
  name: 'Master of PR',
  scopes: [{ type: 'group', groupId: BOARD.id }],
} as const
const MK_CONDUCTOR = { id: 'mk-conductor', name: 'Conductor', scopes: [{ type: 'choir', choirId: MK.id }] } as const
const MK_MASTER_OF_CONCERTS = {
  id: 'mk-master-of-concerts',
  name: 'Master of Concerts',
  scopes: [
    { type: 'choir', choirId: MK.id },
    { type: 'group', groupId: CONCERT_MASTERY.id },
  ],
} as const
const MK_MASTER_OF_GIGS = {
  id: 'mk-master-of-gigs',
  name: 'Master of Gigs',
  scopes: [
    { type: 'choir', choirId: MK.id },
    { type: 'group', groupId: GIG_MASTERY.id },
  ],
} as const
const MK_SHEET_MUSIC_FISH = {
  id: 'mk-sheet-music-fish',
  name: 'Sheet Music Fish',
  scopes: [{ type: 'choir', choirId: MK.id }],
} as const
const KK_CONDUCTOR = { id: 'kk-conductor', name: 'Conductor', scopes: [{ type: 'choir', choirId: KK.id }] } as const
const KK_MASTER_OF_CONCERTS = {
  id: 'kk-master-of-concerts',
  name: 'Master of Concerts',
  scopes: [
    { type: 'choir', choirId: KK.id },
    { type: 'group', groupId: CONCERT_MASTERY.id },
  ],
} as const
const KK_MASTER_OF_GIGS = {
  id: 'kk-master-of-gigs',
  name: 'Master of Gigs',
  scopes: [
    { type: 'choir', choirId: KK.id },
    { type: 'group', groupId: GIG_MASTERY.id },
  ],
} as const
const KK_SHEET_MUSIC_FISH = {
  id: 'kk-sheet-music-fish',
  name: 'Sheet Music Fish',
  scopes: [{ type: 'choir', choirId: KK.id }],
} as const
const DK_CONDUCTOR = { id: 'dk-conductor', name: 'Conductor', scopes: [{ type: 'choir', choirId: DK.id }] } as const
const DK_MASTER_OF_CONCERTS = {
  id: 'dk-master-of-concerts',
  name: 'Master of Concerts',
  scopes: [
    { type: 'choir', choirId: DK.id },
    { type: 'group', groupId: CONCERT_MASTERY.id },
  ],
} as const
const DK_MASTER_OF_GIGS = {
  id: 'dk-master-of-gigs',
  name: 'Master of Gigs',
  scopes: [
    { type: 'choir', choirId: DK.id },
    { type: 'group', groupId: GIG_MASTERY.id },
  ],
} as const
const DK_SHEET_MUSIC_FISH = {
  id: 'dk-sheet-music-fish',
  name: 'Sheet Music Fish',
  scopes: [{ type: 'choir', choirId: DK.id }],
} as const
const PARTY_MISTRESS = {
  id: 'party-mistress',
  name: 'Party Mistress',
  scopes: [{ type: 'group', groupId: PARTY_MASTERY.id }],
} as const
const TOUR_TREASURER = {
  id: 'tour-treasurer',
  name: 'Treasurer',
  scopes: [{ type: 'group', groupId: TOUR_COMMITTEE.id }],
} as const
const INSPECTOR = { id: 'inspector', name: 'Inspector', scopes: [{ type: 'csk' }] } as const
const ACCOUNTANT_1 = { id: 'accountant-1', name: 'Accountant 1', scopes: [{ type: 'csk' }] } as const
const ACCOUNTANT_2 = { id: 'accountant-2', name: 'Accountant 2', scopes: [{ type: 'csk' }] } as const
const MK_T1_VOICE_PARENT = {
  id: 'mk-t1-voice-parent',
  name: 'Voice Parent',
  scopes: [{ type: 'section', sectionId: MK_T1.id }],
} as const
const MK_T2_VOICE_PARENT = {
  id: 'mk-t2-voice-parent',
  name: 'Voice Parent',
  scopes: [{ type: 'section', sectionId: MK_T2.id }],
} as const
const MK_B1_VOICE_PARENT = {
  id: 'mk-b1-voice-parent',
  name: 'Voice Parent',
  scopes: [{ type: 'section', sectionId: MK_B1.id }],
} as const
const MK_B2_VOICE_PARENT = {
  id: 'mk-b2-voice-parent',
  name: 'Voice Parent',
  scopes: [{ type: 'section', sectionId: MK_B2.id }],
} as const
const DK_S1_VOICE_PARENT = {
  id: 'dk-s1-voice-parent',
  name: 'Voice Parent',
  scopes: [{ type: 'section', sectionId: DK_S1.id }],
} as const
const DK_S2_VOICE_PARENT = {
  id: 'dk-s2-voice-parent',
  name: 'Voice Parent',
  scopes: [{ type: 'section', sectionId: DK_S2.id }],
} as const
const DK_A1_VOICE_PARENT = {
  id: 'dk-a1-voice-parent',
  name: 'Voice Parent',
  scopes: [{ type: 'section', sectionId: DK_A1.id }],
} as const
const DK_A2_VOICE_PARENT = {
  id: 'dk-a2-voice-parent',
  name: 'Voice Parent',
  scopes: [{ type: 'section', sectionId: DK_A2.id }],
} as const
const KK_S_VOICE_PARENT = {
  id: 'kk-s-voice-parent',
  name: 'Voice Parent',
  scopes: [{ type: 'section', sectionId: KK_S.id }],
} as const
const KK_A_VOICE_PARENT = {
  id: 'kk-a-voice-parent',
  name: 'Voice Parent',
  scopes: [{ type: 'section', sectionId: KK_A.id }],
} as const
const KK_T_VOICE_PARENT = {
  id: 'kk-t-voice-parent',
  name: 'Voice Parent',
  scopes: [{ type: 'section', sectionId: KK_T.id }],
} as const
const KK_B_VOICE_PARENT = {
  id: 'kk-b-voice-parent',
  name: 'Voice Parent',
  scopes: [{ type: 'section', sectionId: KK_B.id }],
} as const

const positions = [
  PRESIDENT,
  VICE_PRESIDENT,
  TREASURER,
  SECRETARY,
  MASTER_OF_PARTIES,
  MASTER_OF_GIGS,
  MASTER_OF_CONCERTS,
  MASTER_OF_PR,
  MK_CONDUCTOR,
  MK_MASTER_OF_CONCERTS,
  MK_MASTER_OF_GIGS,
  MK_SHEET_MUSIC_FISH,
  KK_CONDUCTOR,
  KK_MASTER_OF_CONCERTS,
  KK_MASTER_OF_GIGS,
  KK_SHEET_MUSIC_FISH,
  DK_CONDUCTOR,
  DK_MASTER_OF_CONCERTS,
  DK_MASTER_OF_GIGS,
  DK_SHEET_MUSIC_FISH,
  PARTY_MISTRESS,
  TOUR_TREASURER,
  INSPECTOR,
  ACCOUNTANT_1,
  ACCOUNTANT_2,
  MK_T1_VOICE_PARENT,
  MK_T2_VOICE_PARENT,
  MK_B1_VOICE_PARENT,
  MK_B2_VOICE_PARENT,
  DK_S1_VOICE_PARENT,
  DK_S2_VOICE_PARENT,
  DK_A1_VOICE_PARENT,
  DK_A2_VOICE_PARENT,
  KK_S_VOICE_PARENT,
  KK_A_VOICE_PARENT,
  KK_T_VOICE_PARENT,
  KK_B_VOICE_PARENT,
] as const

export const topologyData = {
  choirs,
  sections,
  groups,
  positions,
} as const
