import { Candidate, ElectionSettings, Voter } from '../types';

export const DEFAULT_CANDIDATE_PHOTO = '/src/assets/images/paslon_osis_candidate_1790643926962.jpg';
export const DEFAULT_CANDIDATE_TWO_PHOTO = '/src/assets/images/paslon_osis_candidate_two_1790644505350.jpg';
export const DEFAULT_OSIS_EMBLEM = '/src/assets/images/osis_vote_emblem_1790643940520.jpg';

export const initialCandidates: Candidate[] = [
  {
    number: '01',
    chairmanName: 'Arya Pratama Wicaksana',
    viceChairmanName: 'Nadia Salsabila Putri',
    photoUrl: DEFAULT_CANDIDATE_PHOTO,
    vision: 'Mewujudkan OSIS yang berintegritas, kreatif, adaptif terhadap teknologi digital, dan menjadi wadah aspirasi siswa yang inklusif serta berdaya saing global.',
    mission: [
      'Meningkatkan transparansi dan komunikasi aktif antara OSIS, seluruh siswa, dan pihak sekolah melalui platform digital terintegrasi.',
      'Mengembangkan potensi minat, bakat, kepemimpinan, dan kewirausahaan siswa melalui program ekstrakurikuler serta kompetisi inovatif.',
      'Menciptakan lingkungan sekolah yang ramah, berbudaya literasi tinggi, peduli kelestarian lingkungan, dan saling menghargai keberagaman.',
      'Mengoptimalkan pemanfaatan teknologi modern dalam setiap agenda kegiatan sekolah agar lebih efisien dan berdampak positif.'
    ],
    programs: [
      'Digital Student Hub: Portal terpadu informasi lomba, aspirasi, dan kalender kegiatan sekolah.',
      'OSIS Berbagi & Mengabdi: Program kepedulian sosial dan bakti lingkungan berkala.',
      'Pekan Kreativitas Siswa: Festival seni, teknologi, dan olahraga antar kelas tahunan.'
    ]
  },
  {
    number: '02',
    chairmanName: 'Dimas Rayhan Syahputra',
    viceChairmanName: 'Clarissa Aurelia Zahra',
    photoUrl: DEFAULT_CANDIDATE_TWO_PHOTO,
    vision: 'Membangun karakter siswa yang berprestasi, inovatif, berwawasan hijau (eco-school), serta solid dalam kebersamaan kekeluargaan.',
    mission: [
      'Menggalakkan gerakan Green Campus & digitalisasi efisiensi administrasi kegiatan siswa.',
      'Memperluas wadah aspirasi siswa dengan forum terbuka bulanan bersama pengurus sekolah.',
      'Mengadakan mentoring kepemimpinan dan pelatihan keterampilan digital untuk seluruh siswa.',
      'Memperkuat kolaborasi antarekskul guna meraih prestasi akademik dan non-akademik di tingkat nasional.'
    ],
    programs: [
      'Eco-School Movement: Program daur ulang cerdas dan taman hijau sekolah asri.',
      'OSIS Creative Space: Wadah workshop podcast, sinematografi, dan teknologi siswa.',
      'Liga Olahraga & E-Sports Sekolah: Turnamen persahabatan antar kelas bergengsi.'
    ]
  }
];

export const initialCandidate: Candidate = initialCandidates[0];

export const initialSettings: ElectionSettings = {
  schoolName: 'SMA NEGERI 1 TELADAN',
  schoolLogoUrl: DEFAULT_OSIS_EMBLEM,
  electionYear: '2026/2027',
  startDate: '2026-09-28T07:30',
  endDate: '2026-09-29T15:00',
  votingStatus: 'DIBUKA',
  publicResultStatus: 'DITAMPILKAN',
  adminPin: 'admin123'
};

export const initialVoters: Voter[] = [
  {
    id: 'vtr-001',
    nisn: '0078123401',
    name: 'Ahmad Faiz Al-Rasyid',
    class: 'XII MIPA 1',
    hasVoted: true,
    votedAt: '2026-09-28T08:15:22.000Z'
  },
  {
    id: 'vtr-002',
    nisn: '0078123402',
    name: 'Bintang Putri Maharani',
    class: 'XII MIPA 1',
    hasVoted: true,
    votedAt: '2026-09-28T08:24:45.000Z'
  },
  {
    id: 'vtr-003',
    nisn: '0078123403',
    name: 'Cahyo Dimas Nugroho',
    class: 'XII MIPA 2',
    hasVoted: false,
    votedAt: null
  },
  {
    id: 'vtr-004',
    nisn: '0078123404',
    name: 'Dinda Ayu Lestari',
    class: 'XII IPS 1',
    hasVoted: false,
    votedAt: null
  },
  {
    id: 'vtr-005',
    nisn: '0078123405',
    name: 'Eko Prasetyo',
    class: 'XI MIPA 3',
    hasVoted: true,
    votedAt: '2026-09-28T09:05:10.000Z'
  },
  {
    id: 'vtr-006',
    nisn: '0078123406',
    name: 'Fathur Rahman Malik',
    class: 'XI IPS 2',
    hasVoted: false,
    votedAt: null
  },
  {
    id: 'vtr-007',
    nisn: '0078123407',
    name: 'Gita Kirana Dewi',
    class: 'XI BAHASA 1',
    hasVoted: false,
    votedAt: null
  },
  {
    id: 'vtr-008',
    nisn: '0078123408',
    name: 'Hafiz Aditya Pratama',
    class: 'X-1',
    hasVoted: true,
    votedAt: '2026-09-28T09:30:18.000Z'
  },
  {
    id: 'vtr-009',
    nisn: '0078123409',
    name: 'Indah Permata Sari',
    class: 'X-2',
    hasVoted: false,
    votedAt: null
  },
  {
    id: 'vtr-010',
    nisn: '0078123410',
    name: 'Jovan Nathaniel Wijaya',
    class: 'X-4',
    hasVoted: false,
    votedAt: null
  },
  {
    id: 'vtr-011',
    nisn: '0078123411',
    name: 'Kezia Angeline',
    class: 'XII MIPA 3',
    hasVoted: false,
    votedAt: null
  },
  {
    id: 'vtr-012',
    nisn: '0078123412',
    name: 'Lukman Hakim',
    class: 'XI MIPA 1',
    hasVoted: false,
    votedAt: null
  }
];
