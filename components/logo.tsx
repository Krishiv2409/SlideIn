import Image from 'next/image'

export function Logo({ 
  className, 
  size = 'md',
  showBackground = false,
  showText = true
}: { 
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBackground?: boolean;
  showText?: boolean;
}) {
  // Size mapping
  const sizeMap = {
    sm: { width: 24, height: 24, padding: 'p-1' },
    md: { width: 34, height: 34, padding: 'p-1.5' },
    lg: { width: 48, height: 48, padding: 'p-2' },
    xl: { width: 64, height: 64, padding: 'p-2.5' }
  }

  const { width, height, padding } = sizeMap[size]
  
  return (
    <div className={`
      flex items-center gap-3
      ${showBackground ? `${padding} rounded-md bg-pink-500` : ''}
      ${className || ''}
    `}>
      <Image 
        src="/plane-logo.svg" 
        alt="SlideIn Logo" 
        width={width} 
        height={height} 
        className={`${showBackground ? 'text-white' : ''}`}
      />
      {showText && (
        <Image
          src="/logo-text.svg"
          alt="SlideIn"
          width={width * 3}
          height={height}
          className="object-contain"
        />
      )}
    </div>
  )
} 