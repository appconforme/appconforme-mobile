import { Redirect } from 'expo-router';

// Compat: a antiga rota /(tabs)/perfil agora vive sob /(tabs)/mais.
export default function PerfilRedirect() {
  return <Redirect href={'/(tabs)/mais' as never} />;
}
