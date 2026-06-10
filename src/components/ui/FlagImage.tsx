'use client'

interface FlagImageProps {
  src: string
  width?: number
  height?: number
  borderRadius?: number
}

export default function FlagImage({ src, width = 24, height = 16, borderRadius = 3 }: FlagImageProps) {
  return (
    <img
      src={src}
      alt=""
      style={{ width, height, objectFit: 'cover', borderRadius }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
    />
  )
}
