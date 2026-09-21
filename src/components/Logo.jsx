// src/components/Logo.jsx
export function Logo({ size = 40, className = '', personaId = null, isMain = false, overflow = false }) {
  const src = isMain ? '/logo.png' : (personaId ? `/logo_${personaId}.png` : '/logo_Sera16.png');
  return (
    <img
      src={src}
      alt="AI Avatar"
      className={className}
      style={{
        width: overflow ? `${size * 1.05}px` : `${size}px`,
        height: overflow ? `${size * 1.05}px` : `${size}px`,
        objectFit: 'cover',
        objectPosition: 'center top',
      }}
    />
  );
}