import { useState } from 'react';
import { Bot, Sparkles, User } from 'lucide-react';
import { getPersonaImageUrl, getMainLogoUrl } from '../lib/constants';
import { loadCustomPersonas } from '../lib/storage';

interface LogoProps {
  size?: number;
  className?: string;
  personaId?: string | null;
  isMain?: boolean;
  overflow?: boolean;
  alt?: string;
}

export function Logo({
  size = 40,
  className = '',
  personaId = null,
  isMain = false,
  overflow = false,
  alt = 'AI Avatar',
}: LogoProps) {
  const [imgError, setImgError] = useState(false);

  const imgSrc = isMain
    ? getMainLogoUrl()
    : getPersonaImageUrl(personaId, 'logo');

  if (imgError) {
    const custom = personaId ? loadCustomPersonas().find((p) => p.id === personaId) : null;
    const isMale = personaId?.includes('Distil');
    const isWife = personaId?.includes('wife');
    const isBd = personaId?.includes('bd');
    const bgGradient = isMain
      ? 'from-pink-500 to-indigo-600'
      : isWife
      ? 'from-rose-400 to-pink-600'
      : isBd
      ? 'from-emerald-500 to-teal-700'
      : isMale
      ? 'from-blue-500 to-indigo-700'
      : 'from-fuchsia-500 to-pink-500';

    return (
      <div
        className={`flex items-center justify-center rounded-xl ${
          custom?.badgeColor ? '' : `bg-gradient-to-br ${bgGradient}`
        } text-white font-bold shadow-sm ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          fontSize: `${Math.max(12, size * 0.38)}px`,
          backgroundColor: custom?.badgeColor || undefined,
        }}
      >
        {isMain ? (
          <Sparkles size={size * 0.55} className="animate-pulse" />
        ) : custom ? (
          custom.name.slice(0, 2).toUpperCase()
        ) : personaId ? (
          personaId.slice(0, 2).toUpperCase()
        ) : (
          <Bot size={size * 0.55} />
        )}
      </div>
    );
  }

  const dimension = overflow ? size * 1.08 : size;

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => setImgError(true)}
      className={`rounded-xl object-cover object-top transition-transform ${className}`}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        maxWidth: `${dimension}px`,
        maxHeight: `${dimension}px`,
      }}
    />
  );
}

export function UserAvatar({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-gradient-to-tr from-zinc-700 to-zinc-900 text-white shadow-sm shrink-0 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <User size={size * 0.5} />
    </div>
  );
}
