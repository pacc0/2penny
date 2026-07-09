# PRINCIPLES.md — Filtro de los Cinco Principios (ley suprema)

Toda propuesta (feature, refactor, herramienta, dependencia, abstracción) debe
pasar LOS CINCO. Uno que falle = REJECT con justificación escrita.

1. **Problema real** — resuelve un problema que existe HOY, no uno hipotético.
2. **Solución más simple** — no existe una alternativa más simple que lo resuelva.
3. **Sin abstracción innecesaria** — no introduce capas, tooling o indirección
   que no compre un beneficio proporcional.
4. **Single-user fit** — dimensionado para un solo usuario (Camilo); nada de
   escala multiusuario, auth compleja ni infraestructura especulativa.
5. **Complejidad diferible se difiere** — si puede posponerse con seguridad,
   se pospone y se registra (ROADMAP/DECISIONS), no se construye "por si acaso".

## Reglas duras asociadas
- **Evidence over narrative:** el estado del sistema se confirma con salida
  real (git, HTTP, diffs, screenshots), nunca con resúmenes sin verificar.
- **Costo monetario cero:** free tier. Única excepción pre-acordada: dominio
  propio (~10 USD/año) como Plan B de Access — no activado (Etapa 0 dio PASS).
- Las decisiones se bloquean formalmente (DECISIONS.md); revisitarlas exige
  revocación explícita, no re-litigio casual.
