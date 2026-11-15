export const MAX_OBJECTIVES = 3;

export const ORBIT_RANK = { flyby: 1, orbit: 2, lander: 3 };

export const ORBIT_NAMES = { flyby: "フライバイ", orbit: "周回", lander: "着陸" };

export const ORBITS = [
  {
    id: "flyby",
    name: "フライバイ",
    en: "FLYBY",
    rank: 1,
    massFactor: 1,
    cost: 0,
    hardwareMass: 0,
    ability: "通過しながらの遠隔観測のみ",
    desc: "近づいて通過しながら観測する。燃料が最も少なく、重い機体でも届く。",
  },
  {
    id: "orbit",
    name: "周回",
    en: "ORBIT",
    rank: 2,
    massFactor: 0.8,
    cost: 12,
    hardwareMass: 12,
    ability: "周回軌道からの遠隔観測・レーダー",
    desc: "惑星の周りを回りながら長期観測する。軌道投入の燃料と機材が必要。",
  },
  {
    id: "lander",
    name: "着陸",
    en: "LANDER",
    rank: 3,
    massFactor: 0.55,
    cost: 26,
    hardwareMass: 22,
    ability: "地表での採取・掘削・分析",
    desc: "降下して地表で直接調査する。発見は最大だが、質量の余裕は最も少ない。",
  },
];

export const BUSES = [
  {
    id: "sparrow",
    name: "スパロー級",
    en: "SPARROW BUS",
    cost: 20,
    dryMass: 45,
    power: 16,
    level: 1,
    desc: "小型で安価な機体。発電量が少なく、電力を食う機器は載せられない。",
  },
  {
    id: "kestrel",
    name: "ケストレル級",
    en: "KESTREL BUS",
    cost: 34,
    dryMass: 90,
    power: 30,
    level: 1,
    desc: "標準的な機体。電力と質量のバランスが取れている。",
  },
  {
    id: "condor",
    name: "コンドール級",
    en: "CONDOR BUS",
    cost: 52,
    dryMass: 150,
    power: 46,
    level: 3,
    desc: "大型で発電量が多い。ただし重く、打ち上げ質量を大きく占める。",
  },
];

export const LAUNCHERS = [
  {
    id: "sprint",
    name: "スプリント I",
    en: "SPRINT I",
    cost: 28,
    capacity: 90,
    maxOrbit: "flyby",
    level: 1,
    desc: "小型の固体ロケット。フライバイまでしか届かない。",
  },
  {
    id: "vector",
    name: "ベクター II",
    en: "VECTOR II",
    cost: 58,
    capacity: 180,
    maxOrbit: "orbit",
    level: 1,
    desc: "中型ロケット。周回軌道まで投入できる。",
  },
  {
    id: "atlas",
    name: "アトラス重型",
    en: "ATLAS HEAVY",
    cost: 96,
    capacity: 320,
    maxOrbit: "lander",
    level: 1,
    desc: "大型ロケット。降下機を含む着陸ミッションに対応する。",
  },
];

export const COMMS = [
  {
    id: "lga",
    name: "低利得アンテナ",
    en: "LOW GAIN",
    cost: 10,
    mass: 3,
    power: 2,
    bandwidth: 6,
    level: 1,
    desc: "軽くて省電力。遠い惑星では送れるデータ量が細くなる。",
  },
  {
    id: "mga",
    name: "中利得アンテナ",
    en: "MEDIUM GAIN",
    cost: 22,
    mass: 7,
    power: 5,
    bandwidth: 14,
    level: 1,
    desc: "標準的な通信系。近距離なら十分な帯域がある。",
  },
  {
    id: "hga",
    name: "高利得アンテナ",
    en: "HIGH GAIN",
    cost: 38,
    mass: 13,
    power: 8,
    bandwidth: 26,
    level: 3,
    desc: "大量のデータを送れるが、重く電力を消費する。",
  },
];

export const busById = Object.fromEntries(BUSES.map((item) => [item.id, item]));
export const launcherById = Object.fromEntries(LAUNCHERS.map((item) => [item.id, item]));
export const orbitById = Object.fromEntries(ORBITS.map((item) => [item.id, item]));
export const commsById = Object.fromEntries(COMMS.map((item) => [item.id, item]));

export function defaultDesign() {
  return {
    objectives: [],
    instruments: [],
    busId: "kestrel",
    launcherId: "vector",
    orbitId: "orbit",
    commsId: "mga",
  };
}