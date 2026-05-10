interface TrashZoneProps {
  overTrash: boolean
}

const TrashZone = ({ overTrash }: TrashZoneProps) => {
  const stateClass = overTrash ? 'is-active trash-zone--active' : ''

  return (
    <div className={`trash-zone ${stateClass}`} aria-hidden="true">
      <svg className="trash-zone-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path d="M8 4h8l1 2h4v2H3V6h4l1-2zm1 6h2v8H9v-8zm4 0h2v8h-2v-8z" />
      </svg>
    </div>
  )
}

export default TrashZone
