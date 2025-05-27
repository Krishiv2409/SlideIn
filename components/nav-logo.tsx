import Link from "next/link"
import { Logo } from "./logo"
import { useSidebar } from "./ui/sidebar"

interface NavLogoProps {
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showBackground?: boolean
  href?: string
}

export function NavLogo({ 
  showText = false,
  size = 'md', 
  className = '',
  showBackground = true,
  href = "/"
}: NavLogoProps) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  
  if (isCollapsed) {
    return null;
  }
  
  const logoComponent = (
    <div className={`flex items-center ${className}`}>
      <Logo 
        size={size} 
        showBackground={showBackground}
        showText={false}
        className={`${showText && !isCollapsed ? 'mr-2' : ''}`} 
      />
      {showText && !isCollapsed && (
        <span className="text-base font-semibold font-display">SlideIn</span>
      )}
    </div>
  )
  
  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition-opacity">
        {logoComponent}
      </Link>
    )
  }
  
  return logoComponent
} 