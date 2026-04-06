'use client';

const AIRCRAFT_COLORS = [
  { body: '#EF4444', stripe: '#FCA5A5', trim: '#7F1D1D' }, // Red
  { body: '#3B82F6', stripe: '#93C5FD', trim: '#1E3A8A' }, // Blue
  { body: '#10B981', stripe: '#A7F3D0', trim: '#065F46' }, // Green
  { body: '#F59E0B', stripe: '#FEE2BD', trim: '#92400E' }, // Amber
  { body: '#8B5CF6', stripe: '#DDD6FE', trim: '#3F0F5C' }, // Purple
  { body: '#EC4899', stripe: '#FBCFE8', trim: '#500724' }, // Pink
  { body: '#14B8A6', stripe: '#CCFBF1', trim: '#134E4A' }, // Teal
  { body: '#F97316', stripe: '#FDEDD5', trim: '#7C2D12' }, // Orange
];

interface AircraftImageProps {
  index: number;
}

export default function AircraftImage({ index }: AircraftImageProps) {
  const colors = AIRCRAFT_COLORS[index % AIRCRAFT_COLORS.length];

  return (
    <svg
      viewBox="0 0 400 300"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sky gradient background */}
      <defs>
        <linearGradient id={`skyGradient${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#E0F2FE', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#BAE6FD', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id={`fuselageGradient${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: colors.body, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: colors.stripe, stopOpacity: 0.8 }} />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="400" height="300" fill={`url(#skyGradient${index})`} />

      {/* Clouds */}
      <ellipse cx="80" cy="50" rx="35" ry="20" fill="#FFFFFF" opacity="0.6" />
      <ellipse cx="100" cy="55" rx="40" ry="22" fill="#FFFFFF" opacity="0.5" />
      <ellipse cx="320" cy="80" rx="50" ry="25" fill="#FFFFFF" opacity="0.6" />
      <ellipse cx="350" cy="85" rx="45" ry="23" fill="#FFFFFF" opacity="0.5" />

      {/* Ground */}
      <rect y="240" width="400" height="60" fill="#9CA3AF" />

      {/* Main fuselage */}
      <ellipse cx="200" cy="150" rx="45" ry="28" fill={`url(#fuselageGradient${index})`} />

      {/* Cockpit */}
      <ellipse cx="175" cy="140" rx="18" ry="20" fill={colors.trim} />
      <circle cx="175" cy="135" r="8" fill="#1F2937" />
      <circle cx="175" cy="135" r="5" fill="#60A5FA" opacity="0.7" />

      {/* Fuselage stripe */}
      <rect x="160" y="155" width="80" height="6" fill={colors.stripe} opacity="0.6" />

      {/* Wings */}
      <ellipse cx="200" cy="145" rx="80" ry="18" fill={colors.body} opacity="0.9" />
      <ellipse cx="200" cy="145" rx="75" ry="14" fill={colors.stripe} opacity="0.5" />

      {/* Wing struts */}
      <line x1="160" y1="165" x2="160" y2="200" stroke={colors.trim} strokeWidth="3" />
      <line x1="240" y1="165" x2="240" y2="200" stroke={colors.trim} strokeWidth="3" />

      {/* Horizontal stabilizer */}
      <ellipse cx="225" cy="168" rx="35" ry="12" fill={colors.body} opacity="0.85" />

      {/* Vertical stabilizer */}
      <polygon points="230,150 230,180 245,170" fill={colors.body} opacity="0.9" />

      {/* Landing gear */}
      <g>
        {/* Left gear */}
        <rect x="180" y="170" width="4" height="35" fill={colors.trim} />
        <ellipse cx="182" cy="210" rx="8" ry="6" fill="#1F2937" />

        {/* Right gear */}
        <rect x="216" y="170" width="4" height="35" fill={colors.trim} />
        <ellipse cx="218" cy="210" rx="8" ry="6" fill="#1F2937" />

        {/* Nose gear */}
        <rect x="197" y="175" width="3" height="30" fill={colors.trim} />
        <ellipse cx="198.5" cy="210" rx="6" ry="5" fill="#1F2937" />
      </g>

      {/* Propeller */}
      <circle cx="155" cy="150" r="6" fill={colors.trim} />
      <ellipse cx="155" cy="130" rx="4" ry="22" fill="#1F2937" opacity="0.8" />
      <ellipse cx="155" cy="170" rx="4" ry="22" fill="#1F2937" opacity="0.8" />
      <ellipse cx="140" cy="150" rx="16" ry="4" fill="#1F2937" opacity="0.7" />

      {/* N-number placard area (simplified) */}
      <rect x="235" y="155" width="35" height="18" fill="#FFFFFF" stroke={colors.trim} strokeWidth="1" />
      <text x="252" y="166" fontSize="8" fontWeight="bold" fill={colors.trim} textAnchor="middle">
        N-REG
      </text>
    </svg>
  );
}
