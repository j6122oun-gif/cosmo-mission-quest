export function introLines(planet) {
  const note = planet.env?.note ? ` ${planet.env.note}` : "";
  return [
    `こちらミッションコントロール。回線は良好です。${planet.name}への探査計画を始めましょう。`,
    `地球からの距離は${planet.distance}、航行期間は${planet.travel}。${note}`,
    "まず、今回の探査でいちばん大切にしたいことを教えてください。そちらに合わせて設計案を組みます。",
  ];
}

export function intentReplyLines(intent) {
  return [intent.reply];
}

export function proposalLines(planet, recommendation, intent) {
  const { sim, design } = recommendation;
  const massMargin = sim.mass.margin >= 0 ? `余裕${sim.mass.margin}kg` : `${Math.abs(sim.mass.margin)}kg不足`;

  const lines = [
    `${planet.name}ミッション、${intent.short}の方針で組んだ一案です。`,
    `打上げ機は${sim.names.launcher}、軌道は${sim.names.orbit}、機体は${sim.names.bus}、通信は${sim.names.comms}。科学機器は${design.instruments.length}基、目標は${design.objectives.length}件です。`,
    `見積は${sim.budget.used}億円（配分${sim.budget.limit}億円）、打上げ質量は${sim.mass.used}kg（能力${sim.mass.limit}kg・${massMargin}）、消費電力は${sim.power.used}kW（発電${sim.power.limit}kW）です。`,
  ];

  if (sim.verdict === "go") {
    lines.push("この条件なら打ち上げは可能と判断します。設計画面に送ってよろしいですか？");
  } else {
    lines.push(
      `正直に言うと、この案では${sim.blockedCount}件の目標が達成できません。設計画面で組み直すこともできます。どうしますか？`,
    );
  }

  return lines;
}

export function againLines() {
  return ["了解しました。では、狙いから選び直しましょう。"];
}