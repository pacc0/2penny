// Category data dictionaries (ADR-0018 D3) — strictly-typed TS constants,
// data, NOT surface tokens. Values copied byte-identical from the legacy
// reference (backend/src/DashboardPage.html; DESIGN.md §2 Category Colors,
// locked 2026-07-05). Keyed to DATA_MODEL.md's 18 categories
// (14 expense + 4 income).

export type IncomeCategory =
  | 'Salario / Honorarios'
  | 'Inversiones / Rendimientos'
  | 'Reintegros / Devoluciones'
  | 'Otros Ingresos';

export type ExpenseCategory =
  | 'Obligación Mamá'
  | 'Obligación Papá'
  | 'Vivienda / Arriendo'
  | 'Servicios'
  | 'Suscripciones'
  | 'Alimentación'
  | 'Restaurantes / Domicilios'
  | 'Transporte'
  | 'Compras Personales'
  | 'Salud / Bienestar'
  | 'Mascotas'
  | 'Viajes'
  | 'Ocio / Entretenimiento'
  | 'Imprevistos / Emergencias';

export type Category = IncomeCategory | ExpenseCategory;

// Fixed per-category palette (hue-distance checked). Only expense categories
// reach the donut in practice (DASHBOARD.md §3.3); an unmapped category
// renders in --ink-muted rather than breaking — degraded, never broken.
export const CATEGORY_COLOR: Record<ExpenseCategory, string> = {
  'Obligación Mamá': '#F472B6',
  'Obligación Papá': '#4F8EF7',
  'Vivienda / Arriendo': '#8B5CF6',
  'Servicios': '#FACC15',
  'Suscripciones': '#6366F1',
  'Alimentación': '#22C55E',
  'Restaurantes / Domicilios': '#FB923C',
  'Transporte': '#A63F99',
  'Compras Personales': '#D946EF',
  'Salud / Bienestar': '#8B1E3F',
  'Mascotas': '#84CC16',
  'Viajes': '#0EA5E9',
  'Ocio / Entretenimiento': '#3EA630',
  'Imprevistos / Emergencias': '#F59E0B'
};

// Category -> short display name for space-constrained surfaces (doughnut
// tooltip title, Top-3 list). Ratified Stage 7 (stage-7-cutover plan, R4):
// dominant word of compound names; single-word names stay unchanged.
export const CATEGORY_SHORT: Record<ExpenseCategory, string> = {
  'Obligación Mamá': 'Mamá',
  'Obligación Papá': 'Papá',
  'Vivienda / Arriendo': 'Vivienda',
  'Servicios': 'Servicios',
  'Suscripciones': 'Suscripciones',
  'Alimentación': 'Alimentación',
  'Restaurantes / Domicilios': 'Restaurantes',
  'Transporte': 'Transporte',
  'Compras Personales': 'Compras',
  'Salud / Bienestar': 'Salud',
  'Mascotas': 'Mascotas',
  'Viajes': 'Viajes',
  'Ocio / Entretenimiento': 'Ocio',
  'Imprevistos / Emergencias': 'Imprevistos'
};

// Category -> emoji lookup for the donut tooltip title. An unmapped category
// keeps its name in the tooltip title rather than guessing an emoji.
export const CATEGORY_EMOJI: Record<Category, string> = {
  'Salario / Honorarios': '💼',
  'Inversiones / Rendimientos': '📈',
  'Reintegros / Devoluciones': '↩️',
  'Otros Ingresos': '💰',
  'Obligación Mamá': '👩',
  'Obligación Papá': '👨',
  'Vivienda / Arriendo': '🏠',
  'Servicios': '⚡',
  'Suscripciones': '🔄',
  'Alimentación': '🛒',
  'Restaurantes / Domicilios': '🍽️',
  'Transporte': '🚗',
  'Compras Personales': '🛍️',
  'Salud / Bienestar': '🩺',
  'Mascotas': '🐾',
  'Viajes': '✈️',
  'Ocio / Entretenimiento': '🎮',
  'Imprevistos / Emergencias': '🚨'
};
