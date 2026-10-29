import { useState } from 'react'
import { FiStar } from 'react-icons/fi'
import './StarRating.css'

export default function StarRating({ value = 0, onChange, max = 10, readOnly = false }) {
  const [hovered, setHovered] = useState(0)

  const display = hovered || value

  return (
    <div
      className={`star-rating ${readOnly ? 'star-rating--readonly' : ''}`}
      onMouseLeave={() => !readOnly && setHovered(0)}
      aria-label={`Rating: ${value} out of ${max}`}
    >
      {Array.from({ length: max }, (_, i) => {
        const star = i + 1
        const isActive = star <= display
        return (
          <button
            key={star}
            type="button"
            className={`star-rating__star ${isActive ? 'active' : ''}`}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onClick={() => {
              if (!readOnly) {
                // Toggle off if clicking same value
                onChange(star === value ? 0 : star)
              }
            }}
            disabled={readOnly}
            aria-label={`Rate ${star} out of ${max}`}
          >
            <FiStar
              size={18}
              style={{ fill: isActive ? 'var(--gold)' : 'transparent' }}
            />
          </button>
        )
      })}
      {!readOnly && (
        <span className="star-rating__value">
          {display > 0 ? `${display}/${max}` : 'Rate it'}
        </span>
      )}
    </div>
  )
}
