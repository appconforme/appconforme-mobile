# AppConforme Mobile (Expo)

App de execução em campo. **Não é o web admin.** Aqui o operador (worker/inspector) pega tarefa, responde inspeção e anexa evidência.

## Stack

- Expo SDK 52+ com `expo-router` (file-based routing)
- TypeScript estrito
- React Query + Zustand
- `expo-secure-store` pra tokens
- `expo-image-picker` + `expo-camera` (Fase D)
- `expo-crypto` pra SHA-256

## Convenções

- Rotas: `app/(auth)/...` e `app/(tabs)/...` agrupam por contexto.
- Aliases: `@/...` aponta pra `src/...`.
- Mesma URL base que web: `apiUrl` em `app.json#expo.extra.apiUrl` ou env `EXPO_PUBLIC_API_URL`.
- Contratos de domínio (Inspection, Task, Evidence, etc.) **espelham o backend exatamente** — sem renomeação.
- Helpers de permissão (`isManagerRole`, `canStartInspection`) compartilham nome/semântica com o web admin.
- Renderers de items de inspeção: um arquivo por tipo, em `src/components/inspections/renderers/`. Contrato: `{ item, value, onChange, disabled }`.
- Tokens NUNCA em AsyncStorage. Use `expo-secure-store`.

## Multiempresa

- `/me` traz `companies: [{ companyUserId, companyId, role, ... }]`.
- Empresa ativa fica no `useAuthStore`. `X-Company-Id` é injetado pelo `apiCall` quando setado.
- Worker/Inspector veem só os próprios recursos (regra da API).

## Idempotency

POSTs que criam estado precisam mandar `Idempotency-Key` (UUID v4). Crítico em mobile por causa de rede instável + retry.
