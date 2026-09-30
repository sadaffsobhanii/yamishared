import { useRef, useState } from 'react'
import { PencilIcon, PrimaryButton, Screen } from '../components/ui'

export function ConfirmScreen({
  items,
  onChange,
  onBack,
  onLooksRight,
}: {
  items: string[]
  onChange: (items: string[]) => void
  onBack: () => void
  onLooksRight: () => void
}) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const addLock = useRef(false)

  function commitAdd() {
    if (addLock.current) return
    addLock.current = true
    const next = draft.trim()
    if (next) onChange([...items, next.slice(0, 40)])
    setDraft('')
    setAdding(false)
  }

  return (
    <Screen
      className="confirm"
      onBack={onBack}
      footer={
        <PrimaryButton onClick={onLooksRight} disabled={items.length === 0}>
          Looks right
        </PrimaryButton>
      }
    >
      <h1>Does this look like your plate?</h1>
      <p className="sub">Tap the pencil if I missed a word, or add anything I skipped.</p>
      <div className="food-chips">
        {items.map((item, index) => (
          <FoodChip
            key={`${item}-${index}`}
            label={item}
            onCommit={(next) => {
              const copy = [...items]
              copy[index] = next
              onChange(copy)
            }}
            onRemove={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
          />
        ))}
        {adding ? (
          <input
            className="chip-input"
            autoFocus
            value={draft}
            maxLength={40}
            placeholder="Something I missed"
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitAdd}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                commitAdd()
              }
              if (event.key === 'Escape') {
                setDraft('')
                setAdding(false)
              }
            }}
          />
        ) : (
          <button
            type="button"
            className="add-chip"
            onClick={() => {
              addLock.current = false
              setAdding(true)
            }}
          >
            + Add something
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="note">Add at least one thing on the plate, so I can talk about it honestly.</p>
      ) : null}
    </Screen>
  )
}

function FoodChip({
  label,
  onCommit,
  onRemove,
}: {
  label: string
  onCommit: (next: string) => void
  onRemove: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(label)
  const cancelRef = useRef(false)

  if (editing) {
    return (
      <input
        className="chip-input"
        autoFocus
        value={value}
        maxLength={40}
        aria-label={`Edit ${label}`}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => {
          if (cancelRef.current) {
            cancelRef.current = false
            setEditing(false)
            setValue(label)
            return
          }
          const next = value.trim()
          if (!next) onRemove()
          else onCommit(next)
          setEditing(false)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') (event.target as HTMLInputElement).blur()
          if (event.key === 'Escape') {
            cancelRef.current = true
            ;(event.target as HTMLInputElement).blur()
          }
        }}
      />
    )
  }

  return (
    <span className="food-chip">
      {label}
      <button type="button" aria-label={`Edit or clear ${label}`} onClick={() => setEditing(true)}>
        <PencilIcon />
      </button>
    </span>
  )
}
