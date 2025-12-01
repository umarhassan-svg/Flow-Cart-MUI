const uid = (prefix = "n") =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const DEFAULT_DURATION = 6_000; // 6s

export { uid, DEFAULT_DURATION };