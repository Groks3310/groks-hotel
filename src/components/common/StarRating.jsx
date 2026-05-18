import { FiStar } from 'react-icons/fi'

export default function StarRating({ rating, onRate, readonly = false, size = 18 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !readonly && onRate && onRate(star)}
          disabled={readonly}
          className={`transition-colors duration-200 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <FiStar
            size={size}
            className={star <= rating ? 'text-[#C8A96A] fill-current' : 'text-[rgba(200,169,106,0.25)]'}
          />
        </button>
      ))}
    </div>
  )
}