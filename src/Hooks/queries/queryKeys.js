const queryKeys = {
  alumnos: {
    all: ["alumnos"],
    detail: (alumnoId) => ["alumnos", "detail", alumnoId],
    byUser: (userId) => ["alumnos", "by-user", userId],
  },
  buses: {
    all: ["buses"],
    byUser: (userId) => ["buses", "by-user", userId],
    financialsByUser: (userId) => ["buses", "financials", "by-user", userId],
    allFinancials: ["buses", "financials", "all"],
  },
  dashboard: {
    all: ["dashboard"],
    periods: (userId) => ["dashboard", "periods", userId],
    summary: (userId, anio, mes) => ["dashboard", "summary", userId, anio, mes],
  },
  gastos: {
    all: ["gastos"],
    byUser: (userId) => ["gastos", "by-user", userId],
    periods: (userId) => ["gastos", "periods", userId],
  },
  ingresos: {
    all: ["ingresos"],
    byUser: (userId) => ["ingresos", "by-user", userId],
    periods: (userId) => ["ingresos", "periods", userId],
    financialSummary: (userId, anio, mes) => [
      "ingresos",
      "financial-summary",
      userId,
      anio,
      mes,
    ],
  },
};

export { queryKeys };
