export function getContrastTextColor(hexColor?: string): string {
  if (!hexColor) return '#ffffff'
  const c = hexColor.toLowerCase().trim()
  if (
    c === '#9cff00' ||
    c === '#ffff00' ||
    c === '#00e400' ||
    c === '#a3e635' ||
    c === '#facc15' ||
    c === '#84cc16' ||
    c === '#eab308' ||
    c.includes('ffff') ||
    c.includes('9cff')
  ) {
    return '#090d16' // Crisp dark text for bright yellow / lime green background
  }
  return '#ffffff' // White text for dark/vibrant background
}

export function getBadgeStyle(hexColor?: string) {
  const bg = hexColor || '#0284c7'
  return {
    backgroundColor: bg,
    color: getContrastTextColor(bg)
  }
}
