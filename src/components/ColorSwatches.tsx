interface ColorSwatchesProps {
  colors: readonly string[]
  activeColor: string
  onSelect: (color: string) => void
  label: string
  compact?: boolean
}

const ColorSwatches = ({ colors, activeColor, onSelect, label, compact = false }: ColorSwatchesProps) => (
  <div className={`swatches ${compact ? 'swatches--compact' : ''}`} aria-label={label}>
    {colors.map((color) => (
      <button
        key={color}
        type="button"
        className={`swatch ${activeColor === color ? 'is-selected' : ''}`}
        style={{ backgroundColor: color }}
        onClick={() => onSelect(color)}
        aria-label={`Set color ${color}`}
        title={color}
      />
    ))}
  </div>
)

export default ColorSwatches
