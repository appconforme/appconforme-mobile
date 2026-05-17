# Build & Release — AppConforme Mobile

App Expo SDK 52 + expo-router. EAS Build configurado em `eas.json`.

`eas-cli` é invocado via `npx eas-cli` (não fica em `devDependencies` — recomendação do expo-doctor).

## Dev local (Expo Go)

```bash
npm install
npm run start
```

Scan o QR code com o Expo Go (Android) ou Camera (iOS). API: `http://localhost:3000/api/v1` por padrão (`app.json#expo.extra.apiUrl`).

## Primeira configuração (única vez)

1. Logar na conta Expo: `npx eas login` (conta `appconforme`).
2. Inicializar o projeto: `npx eas init` — preenche `expo.extra.eas.projectId` e `expo.updates.url` em `app.json`.
3. Atualizar `expo.owner` em `app.json` se necessário.

## Builds

| Profile | Comando | Distribuição | API |
|---|---|---|---|
| `development` | `npm run build:dev` | interno, dev client, simulator iOS, APK Android | `http://localhost:3000/api/v1` |
| `preview` | `npm run build:preview` | interno (TestFlight + Android internal) | `https://api.staging.appconforme.com.br/api/v1` |
| `production` | `npm run build:prod` | store-ready, autoIncrement | `https://api.appconforme.com.br/api/v1` |

Submissão à loja: `npm run submit:prod`.

## Variáveis de ambiente

Por profile em `eas.json` (já injetadas no build):

- `EXPO_PUBLIC_API_URL` — base da API.
- `EXPO_PUBLIC_ENV` — `development | preview | production`.
- `EXPO_PUBLIC_SENTRY_DSN` — DSN do Sentry. **Vazio por padrão** — preencher com `eas env:create` ou direto no `eas.json` (cuidado: não commitar DSN real).

Para setar via EAS (recomendado, não commita):

```bash
eas env:create --profile production --name EXPO_PUBLIC_SENTRY_DSN --value "https://...@sentry.io/..."
eas env:create --profile preview    --name EXPO_PUBLIC_SENTRY_DSN --value "https://...@sentry.io/..."
```

Para uso local, criar `.env.local`:

```
EXPO_PUBLIC_SENTRY_DSN=https://...
EXPO_PUBLIC_ENV=development
```

## Sentry

- SDK: `@sentry/react-native` v8 (sentry-expo está deprecated para SDK 50+).
- Init: `src/lib/errors/sentry.ts` — chamado no topo de `app/_layout.tsx`.
- Sem DSN setado, init é no-op (sem ruído em dev).
- Helpers: `captureError(err, ctx?)`, `setSentryUser({id,email})`, `clearSentryUser()`.
- User context auto-setado pelo `useAuthStore` (login/setMe/logout).
- Plugin `@sentry/react-native/expo` em `app.json` cuida do upload de sourcemaps no build.

Para o upload de sourcemaps funcionar no CI/build, configurar no Sentry CLI auth token:

```bash
eas secret:create --scope project --name SENTRY_AUTH_TOKEN --value "sntrys_..."
```

## Atualização OTA

`runtimeVersion.policy: "appVersion"` — apenas builds com mesma `expo.version` recebem o update. Após `eas init`, usar `eas update --branch production`.
