import { useEffect, useRef } from 'react'
import { drawRing } from './fuel'

export function FuelRing({ score, size }: { score: number | null; size: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (ref.current) drawRing(ref.current, score)
  }, [score, size])
  return <canvas ref={ref} width={size * 2} height={size * 2} style={{ width: size, height: size }} />
}
