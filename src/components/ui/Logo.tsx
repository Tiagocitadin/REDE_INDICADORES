import { Image } from 'react-native';

type Props = {
  tamanho?: number;
  /** Cor sólida; sem ela o símbolo usa o degradê cobre original */
  cor?: string;
};

const imagem = require('../../../assets/images/logo.png');

/** Símbolo da marca: gota com anel na base e o "S" no topo */
export function Logo({ tamanho = 32, cor }: Props) {
  return (
    <Image
      source={imagem}
      accessibilityRole="image"
      accessibilityLabel="Logo"
      resizeMode="contain"
      style={{ width: tamanho, height: tamanho, tintColor: cor }}
    />
  );
}
