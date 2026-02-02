/**
 * Datos de prueba para el usuario Grobas cuando no hay conexión a la base de datos.
 * dayOffset: días respecto a hoy (0 = hoy, -1 = ayer, -14 = hace 14 días).
 * Las fechas se calculan en tiempo de ejecución para que "últimas 2 semanas" sea siempre relativo.
 */

export const GROBAS_USER_ID = 'grobas-001';

export interface MockLogEntry {
  dayOffset: number;
  projectId: string;
  projectName: string;
  durationSeconds: number;
  status: 'NORMAL' | 'PRESET' | 'MANUAL';
}

/** Proyectos de prueba (mismo orden/IDs que en db.ts LOCAL_MOCK_PROJECTS) */
export const GROBAS_MOCK_PROJECTS = [
  { id: 'PJ-DEMO-1', name: 'Phoenix Rebrand', category: 'Design Systems', color: 'vibrant-red' },
  { id: 'PJ-DEMO-2', name: 'Internal Audit', category: 'Finance & Legal', color: 'vibrant-blue' },
  { id: 'PJ-DEMO-3', name: 'Market Strategy', category: 'Q4 Social Strategy', color: 'vibrant-green' },
  { id: 'PJ-DEMO-4', name: 'API Layer', category: 'Stripe & PayPal Connect', color: 'vibrant-orange' },
  { id: 'PJ-DEMO-5', name: 'Mobile UI Kit', category: 'Product Design', color: 'vibrant-purple' },
  { id: 'PJ-DEMO-6', name: 'Style Guide', category: 'Business Strategy', color: 'vibrant-pink' },
  { id: 'PJ-DEMO-7', name: 'Client Portal', category: 'Support', color: 'vibrant-cyan' },
  { id: 'PJ-DEMO-8', name: 'Admin Core', category: 'Operations', color: 'vibrant-yellow' },
] as const;

/**
 * Registros de tiempo de las últimas ~2 semanas para Grobas.
 * Variedad de proyectos, duraciones y estados (NORMAL, PRESET, MANUAL).
 */
export const GROBAS_MOCK_LOGS: MockLogEntry[] = [
  // Hoy (dayOffset 0)
  { dayOffset: 0, projectId: 'PJ-DEMO-1', projectName: 'Phoenix Rebrand', durationSeconds: 3600, status: 'NORMAL' },
  { dayOffset: 0, projectId: 'PJ-DEMO-3', projectName: 'Market Strategy', durationSeconds: 2700, status: 'NORMAL' },
  { dayOffset: 0, projectId: 'PJ-DEMO-5', projectName: 'Mobile UI Kit', durationSeconds: 1800, status: 'PRESET' },
  // Ayer (-1)
  { dayOffset: -1, projectId: 'PJ-DEMO-2', projectName: 'Internal Audit', durationSeconds: 7200, status: 'NORMAL' },
  { dayOffset: -1, projectId: 'PJ-DEMO-4', projectName: 'API Layer', durationSeconds: 5400, status: 'NORMAL' },
  { dayOffset: -1, projectId: 'PJ-DEMO-7', projectName: 'Client Portal', durationSeconds: 900, status: 'MANUAL' },
  // Hace 2 días
  { dayOffset: -2, projectId: 'PJ-DEMO-1', projectName: 'Phoenix Rebrand', durationSeconds: 4500, status: 'NORMAL' },
  { dayOffset: -2, projectId: 'PJ-DEMO-6', projectName: 'Style Guide', durationSeconds: 3600, status: 'NORMAL' },
  { dayOffset: -2, projectId: 'PJ-DEMO-8', projectName: 'Admin Core', durationSeconds: 1800, status: 'PRESET' },
  // Hace 3 días
  { dayOffset: -3, projectId: 'PJ-DEMO-3', projectName: 'Market Strategy', durationSeconds: 6300, status: 'NORMAL' },
  { dayOffset: -3, projectId: 'PJ-DEMO-5', projectName: 'Mobile UI Kit', durationSeconds: 2700, status: 'NORMAL' },
  { dayOffset: -3, projectId: 'PJ-DEMO-7', projectName: 'Client Portal', durationSeconds: 1200, status: 'MANUAL' },
  // Hace 4 días
  { dayOffset: -4, projectId: 'PJ-DEMO-2', projectName: 'Internal Audit', durationSeconds: 5400, status: 'NORMAL' },
  { dayOffset: -4, projectId: 'PJ-DEMO-4', projectName: 'API Layer', durationSeconds: 3600, status: 'NORMAL' },
  { dayOffset: -4, projectId: 'PJ-DEMO-8', projectName: 'Admin Core', durationSeconds: 4500, status: 'NORMAL' },
  // Hace 5 días
  { dayOffset: -5, projectId: 'PJ-DEMO-1', projectName: 'Phoenix Rebrand', durationSeconds: 7200, status: 'NORMAL' },
  { dayOffset: -5, projectId: 'PJ-DEMO-6', projectName: 'Style Guide', durationSeconds: 1800, status: 'PRESET' },
  // Hace 6 días
  { dayOffset: -6, projectId: 'PJ-DEMO-3', projectName: 'Market Strategy', durationSeconds: 2700, status: 'NORMAL' },
  { dayOffset: -6, projectId: 'PJ-DEMO-5', projectName: 'Mobile UI Kit', durationSeconds: 5400, status: 'NORMAL' },
  { dayOffset: -6, projectId: 'PJ-DEMO-7', projectName: 'Client Portal', durationSeconds: 900, status: 'MANUAL' },
  // Hace 7 días (1 semana)
  { dayOffset: -7, projectId: 'PJ-DEMO-2', projectName: 'Internal Audit', durationSeconds: 3600, status: 'NORMAL' },
  { dayOffset: -7, projectId: 'PJ-DEMO-4', projectName: 'API Layer', durationSeconds: 4500, status: 'NORMAL' },
  { dayOffset: -7, projectId: 'PJ-DEMO-8', projectName: 'Admin Core', durationSeconds: 1800, status: 'NORMAL' },
  // Hace 8 días
  { dayOffset: -8, projectId: 'PJ-DEMO-1', projectName: 'Phoenix Rebrand', durationSeconds: 6300, status: 'NORMAL' },
  { dayOffset: -8, projectId: 'PJ-DEMO-6', projectName: 'Style Guide', durationSeconds: 2700, status: 'NORMAL' },
  // Hace 9 días
  { dayOffset: -9, projectId: 'PJ-DEMO-3', projectName: 'Market Strategy', durationSeconds: 5400, status: 'NORMAL' },
  { dayOffset: -9, projectId: 'PJ-DEMO-5', projectName: 'Mobile UI Kit', durationSeconds: 3600, status: 'PRESET' },
  { dayOffset: -9, projectId: 'PJ-DEMO-7', projectName: 'Client Portal', durationSeconds: 2100, status: 'NORMAL' },
  // Hace 10 días
  { dayOffset: -10, projectId: 'PJ-DEMO-2', projectName: 'Internal Audit', durationSeconds: 7200, status: 'NORMAL' },
  { dayOffset: -10, projectId: 'PJ-DEMO-4', projectName: 'API Layer', durationSeconds: 1800, status: 'MANUAL' },
  // Hace 11 días
  { dayOffset: -11, projectId: 'PJ-DEMO-1', projectName: 'Phoenix Rebrand', durationSeconds: 4500, status: 'NORMAL' },
  { dayOffset: -11, projectId: 'PJ-DEMO-8', projectName: 'Admin Core', durationSeconds: 3600, status: 'NORMAL' },
  // Hace 12 días
  { dayOffset: -12, projectId: 'PJ-DEMO-6', projectName: 'Style Guide', durationSeconds: 5400, status: 'NORMAL' },
  { dayOffset: -12, projectId: 'PJ-DEMO-7', projectName: 'Client Portal', durationSeconds: 2700, status: 'NORMAL' },
  // Hace 13 días
  { dayOffset: -13, projectId: 'PJ-DEMO-3', projectName: 'Market Strategy', durationSeconds: 3600, status: 'NORMAL' },
  { dayOffset: -13, projectId: 'PJ-DEMO-5', projectName: 'Mobile UI Kit', durationSeconds: 4500, status: 'NORMAL' },
  // Hace 14 días (2 semanas)
  { dayOffset: -14, projectId: 'PJ-DEMO-2', projectName: 'Internal Audit', durationSeconds: 2700, status: 'NORMAL' },
  { dayOffset: -14, projectId: 'PJ-DEMO-4', projectName: 'API Layer', durationSeconds: 6300, status: 'NORMAL' },
  { dayOffset: -14, projectId: 'PJ-DEMO-8', projectName: 'Admin Core', durationSeconds: 1800, status: 'PRESET' },
  // Semana 3
  { dayOffset: -15, projectId: 'PJ-DEMO-1', projectName: 'Phoenix Rebrand', durationSeconds: 5400, status: 'NORMAL' },
  { dayOffset: -16, projectId: 'PJ-DEMO-3', projectName: 'Market Strategy', durationSeconds: 3600, status: 'NORMAL' },
  { dayOffset: -16, projectId: 'PJ-DEMO-6', projectName: 'Style Guide', durationSeconds: 2700, status: 'NORMAL' },
  { dayOffset: -17, projectId: 'PJ-DEMO-2', projectName: 'Internal Audit', durationSeconds: 7200, status: 'NORMAL' },
  { dayOffset: -18, projectId: 'PJ-DEMO-5', projectName: 'Mobile UI Kit', durationSeconds: 4500, status: 'NORMAL' },
  { dayOffset: -18, projectId: 'PJ-DEMO-7', projectName: 'Client Portal', durationSeconds: 1800, status: 'MANUAL' },
  { dayOffset: -19, projectId: 'PJ-DEMO-4', projectName: 'API Layer', durationSeconds: 3600, status: 'NORMAL' },
  { dayOffset: -20, projectId: 'PJ-DEMO-8', projectName: 'Admin Core', durationSeconds: 5400, status: 'NORMAL' },
  // Semana 4
  { dayOffset: -21, projectId: 'PJ-DEMO-1', projectName: 'Phoenix Rebrand', durationSeconds: 6300, status: 'NORMAL' },
  { dayOffset: -21, projectId: 'PJ-DEMO-6', projectName: 'Style Guide', durationSeconds: 1800, status: 'PRESET' },
  { dayOffset: -22, projectId: 'PJ-DEMO-3', projectName: 'Market Strategy', durationSeconds: 4500, status: 'NORMAL' },
  { dayOffset: -23, projectId: 'PJ-DEMO-2', projectName: 'Internal Audit', durationSeconds: 2700, status: 'NORMAL' },
  { dayOffset: -23, projectId: 'PJ-DEMO-5', projectName: 'Mobile UI Kit', durationSeconds: 3600, status: 'NORMAL' },
  { dayOffset: -24, projectId: 'PJ-DEMO-7', projectName: 'Client Portal', durationSeconds: 5400, status: 'NORMAL' },
  { dayOffset: -25, projectId: 'PJ-DEMO-4', projectName: 'API Layer', durationSeconds: 7200, status: 'NORMAL' },
  { dayOffset: -26, projectId: 'PJ-DEMO-8', projectName: 'Admin Core', durationSeconds: 3600, status: 'NORMAL' },
  // Semana 5
  { dayOffset: -27, projectId: 'PJ-DEMO-1', projectName: 'Phoenix Rebrand', durationSeconds: 3600, status: 'NORMAL' },
  { dayOffset: -28, projectId: 'PJ-DEMO-6', projectName: 'Style Guide', durationSeconds: 4500, status: 'NORMAL' },
  { dayOffset: -28, projectId: 'PJ-DEMO-3', projectName: 'Market Strategy', durationSeconds: 2700, status: 'NORMAL' },
  { dayOffset: -29, projectId: 'PJ-DEMO-2', projectName: 'Internal Audit', durationSeconds: 5400, status: 'NORMAL' },
  { dayOffset: -30, projectId: 'PJ-DEMO-5', projectName: 'Mobile UI Kit', durationSeconds: 1800, status: 'MANUAL' },
  { dayOffset: -31, projectId: 'PJ-DEMO-7', projectName: 'Client Portal', durationSeconds: 6300, status: 'NORMAL' },
  { dayOffset: -32, projectId: 'PJ-DEMO-4', projectName: 'API Layer', durationSeconds: 3600, status: 'NORMAL' },
  { dayOffset: -33, projectId: 'PJ-DEMO-8', projectName: 'Admin Core', durationSeconds: 4500, status: 'NORMAL' },
  // Semana 6 (hasta ~35 días atrás)
  { dayOffset: -34, projectId: 'PJ-DEMO-1', projectName: 'Phoenix Rebrand', durationSeconds: 7200, status: 'NORMAL' },
  { dayOffset: -35, projectId: 'PJ-DEMO-6', projectName: 'Style Guide', durationSeconds: 2700, status: 'NORMAL' },
  { dayOffset: -35, projectId: 'PJ-DEMO-3', projectName: 'Market Strategy', durationSeconds: 3600, status: 'NORMAL' },
];

/**
 * Genera los logs con fechas reales a partir de hoy.
 */
export function buildGrobasMockLogs(): Array<{
  id: string;
  userId: string;
  projectId: string;
  projectName: string;
  date: string;
  durationSeconds: number;
  status: string;
  created_at: string;
}> {
  const today = new Date();
  return GROBAS_MOCK_LOGS.map((entry, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + entry.dayOffset);
    return {
      id: `MOCK-LOG-${i}-${entry.dayOffset}`,
      userId: GROBAS_USER_ID,
      projectId: entry.projectId,
      projectName: entry.projectName,
      date: d.toDateString(),
      durationSeconds: entry.durationSeconds,
      status: entry.status,
      created_at: d.toISOString(),
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
