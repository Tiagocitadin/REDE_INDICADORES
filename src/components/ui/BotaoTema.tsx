import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';

import { usePreferenciaTema } from '@/theme/TemaProvider';
import { useTema } from '@/theme/useTema';

/** Botão redondo que alterna entre tema claro e escuro. */
export function BotaoTema() {
  const { alternar } = usePreferenciaTema();
  const { cores, escuro } = useTema();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={escuro ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      onPress={alternar}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: cores.borda,
        backgroundColor: cores.superficie,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Ionicons name={escuro ? 'sunny-outline' : 'moon-outline'} size={20} color={cores.texto} />
    </Pressable>
  );
}