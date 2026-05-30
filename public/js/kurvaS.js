function generateSCurve(totalWeeks, k = 0.8) {
  const result = [];
  const midpoint = totalWeeks / 2;

  for (let t = 0; t <= totalWeeks; t++) {
    const value = 100 / (1 + Math.exp(-k * (t - midpoint)));
    result.push(value);
  }

  const min = result[0];
  const max = result[result.length - 1];

  return result.map(v =>
    ((v - min) / (max - min) * 100).toFixed(2)
  );
}
