export interface LevelDef {
  name: string;
  timerSeconds: number;
  rows: string[]; // top row = far end (exit), bottom row = start
}

export const LEVEL_DEFS: LevelDef[] = [
  {
    name: 'Warm-Up Floor',
    timerSeconds: 30,
    rows: [
      '...E...',
      '...M...',
      '.TTMOP.',
      '.T...P.',
      '.T.BBB.',
      '.TTT.O.',
      '...T...',
      '...T...',
      '...S...',
    ],
  },
  {
    name: 'Shortcut Shuffle',
    timerSeconds: 25,
    rows: [
      '...E...',
      '..TMT..',
      '.TTMTT.',
      '.T.O.T.',
      '.TBPBT.',
      '.T.M.T.',
      '.TT.TT.',
      '..T.T..',
      '..TTT..',
      '...S...',
    ],
  },
  {
    name: 'Liar\'s Labyrinth',
    timerSeconds: 20,
    rows: [
      '....E....',
      '...TMT...',
      '..TTOTT..',
      '..T.P.T..',
      '.TTMBMTT.',
      '.T.....T.',
      '.TOT.TOT.',
      '.T.T.T.T.',
      '.TPTMTBT.',
      '...TTT...',
      '...TBT...',
      '....S....',
    ],
  },
];