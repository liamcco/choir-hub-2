/**
 * The fixed organization topology of CSK.
 *
 * This file is intentionally written as domain data. The reference catalog
 * module turns it into the flat records used by the database and forms.
 */
export const referenceCatalogData = {
  choirs: [
    {
      id: 'mk',
      name: 'Manskören',
      shortName: 'MK',
      sections: ['T1', 'T2', 'B1', 'B2'],
    },
    {
      id: 'kk',
      name: 'Kammarkören',
      shortName: 'KK',
      sections: [
        { name: 'S', voiceType: 'S', allowedVoiceTypes: ['S1', 'S2'] },
        { name: 'A', voiceType: 'A', allowedVoiceTypes: ['A1', 'A2'] },
        { name: 'T', voiceType: 'T', allowedVoiceTypes: ['T1', 'T2'] },
        { name: 'B', voiceType: 'B', allowedVoiceTypes: ['B1', 'B2'] },
      ],
    },
    {
      id: 'dk',
      name: 'Damkören',
      shortName: 'DK',
      sections: ['S1', 'S2', 'A1', 'A2'],
    },
  ],

  groups: {
    csk: [
      { id: 'board', kind: 'board', name: 'Board' },
      { id: 'concert-mastery', kind: 'committee', name: 'Concert Mastery' },
      { id: 'gig-mastery', kind: 'committee', name: 'Gig Mastery' },
      { id: 'party-mastery', kind: 'committee', name: 'Party Mastery' },
      { id: 'web-mastery', kind: 'committee', name: 'Web Mastery' },
      { id: 'tour-committee', kind: 'committee', name: 'Tour Committee' },
      { id: 'recruitment-committee', kind: 'committee', name: 'Recruitment Committee' },
      { id: 'utantill-committee', kind: 'committee', name: 'Utantill Committee' },
    ],
    perChoir: [
      { id: 'concert', name: 'Concert Group' },
      { id: 'party', name: 'Party Group' },
      { id: 'rodd', name: 'Rodd Group' },
    ],
  },

  positions: {
    board: [
      { id: 'president', name: 'President', additionalGroupIds: [] },
      { id: 'vice-president', name: 'Vice President', additionalGroupIds: [] },
      { id: 'treasurer', name: 'Treasurer', additionalGroupIds: [] },
      { id: 'secretary', name: 'Secretary', additionalGroupIds: [] },
      { id: 'master-of-parties', name: 'Master of Parties', additionalGroupIds: ['party-mastery'] },
      { id: 'master-of-gigs', name: 'Master of Gigs', additionalGroupIds: ['gig-mastery'] },
      { id: 'master-of-concerts', name: '1st Master of Concerts', additionalGroupIds: ['concert-mastery'] },
      { id: 'master-of-pr', name: 'Master of PR', additionalGroupIds: [] },
    ],
    perChoir: [
      { id: 'conductor', name: 'Conductor', additionalGroupIds: [] },
      { id: 'master-of-concerts', name: 'Master of Concerts', additionalGroupIds: ['concert-mastery'] },
      { id: 'master-of-gigs', name: 'Master of Gigs', additionalGroupIds: ['gig-mastery'] },
      { id: 'sheet-music-fish', name: 'Sheet Music Fish', additionalGroupIds: [] },
    ],
    csk: [
      { id: 'party-mistress', name: 'Party Mistress', groupIds: ['party-mastery'] },
      { id: 'tour-treasurer', name: 'Treasurer', groupIds: ['tour-committee'] },
      { id: 'inspector', name: 'Inspector', scope: 'csk' },
      { id: 'accountant-1', name: 'Accountant 1', scope: 'csk' },
      { id: 'accountant-2', name: 'Accountant 2', scope: 'csk' },
    ],
    voiceParents: {
      individualSections: [
        { choirId: 'mk', voiceTypes: ['T1', 'T2', 'B1', 'B2'] },
        { choirId: 'dk', voiceTypes: ['S1', 'S2', 'A1', 'A2'] },
      ],
      kammarkorenFamilies: [
        { id: 's', voiceType: 'S', voiceTypes: ['S1', 'S2'] },
        { id: 'a', voiceType: 'A', voiceTypes: ['A1', 'A2'] },
        { id: 't', voiceType: 'T', voiceTypes: ['T1', 'T2'] },
        { id: 'b', voiceType: 'B', voiceTypes: ['B1', 'B2'] },
      ],
    },
  },
} as const
