import { useEffect, useRef, useState } from 'react'
import { SAMPLES } from '../data/meals'
import { CameraIcon, Screen } from '../components/ui'
import type { MealImage, SampleId } from '../types'

async function fileToPhoto(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not read that photo'))
    img.src = dataUrl
  })

  const max = 900
  const scale = Math.min(1, max / Math.max(image.width, image.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(image.width * scale)
  canvas.height = Math.round(image.height * scale)
  const context = canvas.getContext('2d')
  if (!context) return dataUrl
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.82)
}

export function SnapScreen({
  onBack,
  onCapture,
}: {
  onBack: () => void
  onCapture: (image: MealImage, hint: string) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)
  const cameraFileRef = useRef<HTMLInputElement>(null)
  const [ready, setReady] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(true)
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: 'environment' } },
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setReady(true)
      } catch {
        setCameraError(true)
      }
    }

    void start()
    return () => {
      cancelled = true
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  function captureFrame() {
    const video = videoRef.current
    if (!video || !video.videoWidth || busy) return
    const max = 900
    const scale = Math.min(1, max / Math.max(video.videoWidth, video.videoHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)
    const context = canvas.getContext('2d')
    if (!context) return
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    onCapture({ kind: 'photo', src: canvas.toDataURL('image/jpeg', 0.82) }, 'photo')
  }

  async function onFile(file: File | undefined) {
    if (!file || busy) return
    setBusy(true)
    try {
      const src = await fileToPhoto(file)
      onCapture({ kind: 'photo', src }, file.name)
    } catch {
      setBusy(false)
    }
  }

  return (
    <Screen className="snap" onBack={onBack}>
      <h1>Show me your meal</h1>
      <p className="sub">A photo is plenty. I'll take a look with you.</p>

      <div className="viewfinder">
        <span className="bracket tl" />
        <span className="bracket tr" />
        <span className="bracket bl" />
        <span className="bracket br" />
        {cameraError ? (
          <div className="viewfinder-fallback">
            <p>I can't see the camera from here.</p>
            <p className="sub">You can upload a photo, or borrow one of mine below.</p>
            <button type="button" className="text-button" onClick={() => cameraFileRef.current?.click()}>
              Open your camera
            </button>
          </div>
        ) : (
          <video ref={videoRef} playsInline muted autoPlay />
        )}
      </div>

      {!cameraError && (
        <button type="button" className="shutter" onClick={captureFrame} disabled={!ready || busy} aria-label="Take photo">
          <CameraIcon />
        </button>
      )}

      <button type="button" className="text-button" onClick={() => uploadRef.current?.click()}>
        Upload a photo instead
      </button>

      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          void onFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />
      <input
        ref={cameraFileRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(event) => {
          void onFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />

      <p className="sample-label">No photo handy? Borrow one of these.</p>
      <div className="samples">
        {SAMPLES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            className="sample"
            disabled={busy}
            onClick={() => onCapture({ kind: 'sample', id: sample.id as SampleId }, sample.id)}
          >
            <img src={sample.src} alt="" />
            <span>{sample.label}</span>
          </button>
        ))}
      </div>
    </Screen>
  )
}
