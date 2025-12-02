const uid = (prefix = "n") =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const DEFAULT_DURATION = 3_000; // 6s
const DEFAULT_MAX_VISIBLE = 5;

export { uid, DEFAULT_DURATION , DEFAULT_MAX_VISIBLE };