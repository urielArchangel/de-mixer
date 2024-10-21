import {
    AvatarComponent,
  } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import eth from '@/app/img33acdae0f/eth.png'
  
  export const CustomAvatar: AvatarComponent = ({ address, ensImage, size }) => {
    return ensImage ? (
      <Image
        src={ensImage}
        alt='ens'
        width={size}
        height={size}
        style={{ borderRadius: 999 }}
      />
    ) : (
        <Image
        src={eth}
        alt='ens'
        width={size}
        height={size}
        style={{ borderRadius: 999 }}
      />
    );
  };
  