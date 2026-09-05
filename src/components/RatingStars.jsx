export default function RatingStars({ value = 0, size = 14, showValue = true }) {
  const rounded = Math.round(value * 2) / 2
  const stars = [1, 2, 3, 4, 5]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ display: 'inline-flex' }} aria-hidden="true">
        {stars.map((s) => {
          const fill = rounded >= s ? 1 : rounded >= s - 0.5 ? 0.5 : 0
          return (
            <svg key={s} width={size} height={size} viewBox="0 0 20 20" style={{ marginRight: 1 }}>
              <defs>
                <linearGradient id={`star-${s}-${value}`}>
                  <stop offset={`${fill * 100}%`} stopColor="#C08A28" />
                  <stop offset={`${fill * 100}%`} stopColor="#EBE2CE" />
                </linearGradient>
              </defs>
              <polygon
                points="10,1 12.6,7 19,7.5 14,11.9 15.5,18.5 10,15 4.5,18.5 6,11.9 1,7.5 7.4,7"
                fill={`url(#star-${s}-${value})`}
              />
            </svg>
          )
        })}
      </span>
      {showValue && (
        <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', fontWeight: 600 }}>
          {value ? value.toFixed(1) : 'New'}
        </span>
      )}
    </span>
  )
}
