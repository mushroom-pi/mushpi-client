import React from 'react';

const BG = '#0f1720';
const ACCENT = '#C66F2F';
const TEXT = '#E6F0EA';
const MUTED = '#9AA6A0';
const SUCCESS = '#3C8D5A';
const BOARD_BG = '#0f1b12';
const BOARD_BORDER = '#2a3a2e';

interface IllustrationProps {
  width?: number;
  height?: number;
}

export const LedBlinkIllustration: React.FC<IllustrationProps> = ({
  width = 260,
  height = 180,
}) => (
  <svg
    viewBox="0 0 260 180"
    width={width}
    height={height}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Pico board with blinking LED"
  >
    {/* Background */}
    <rect width="260" height="180" rx="12" fill={BG} />

    {/* Board body */}
    <rect x="40" y="35" width="180" height="95" rx="6" fill={BOARD_BG} stroke={BOARD_BORDER} strokeWidth="1.5" />

    {/* USB port */}
    <rect x="30" y="65" width="16" height="22" rx="2" fill="#888" stroke="#666" strokeWidth="1" />
    <rect x="33" y="69" width="10" height="14" rx="1" fill="#555" />

    {/* GPIO pin headers - top row */}
    {Array.from({ length: 10 }).map((_, i) => (
      <circle key={`top-${i}`} cx={60 + i * 16} cy="42" r="2.5" fill="#888" stroke="#666" strokeWidth="0.5" />
    ))}

    {/* GPIO pin headers - bottom row */}
    {Array.from({ length: 10 }).map((_, i) => (
      <circle key={`bot-${i}`} cx={60 + i * 16} cy="123" r="2.5" fill="#888" stroke="#666" strokeWidth="0.5" />
    ))}

    {/* Chip */}
    <rect x="100" y="60" width="40" height="30" rx="3" fill="#1a1a2e" stroke="#333" strokeWidth="1" />
    <text x="120" y="79" textAnchor="middle" fill={MUTED} fontSize="7" fontFamily="monospace">
      Pico
    </text>

    {/* Onboard LED */}
    <circle cx="185" cy="55" r="5" fill={ACCENT} />
    {/* Pulse ring */}
    <circle cx="185" cy="55" r="10" fill="none" stroke={ACCENT} strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />
    <circle cx="185" cy="55" r="15" fill="none" stroke={ACCENT} strokeWidth="0.5" strokeDasharray="2 3" opacity="0.25" />

    {/* Label */}
    <text x="130" y="155" textAnchor="middle" fill={MUTED} fontSize="11" fontFamily="sans-serif">
      Slow double-blink
    </text>
  </svg>
);

export const JoinWifiIllustration: React.FC<IllustrationProps> = ({
  width = 260,
  height = 180,
}) => (
  <svg
    viewBox="0 0 260 180"
    width={width}
    height={height}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Phone showing Wi-Fi settings"
  >
    {/* Background */}
    <rect width="260" height="180" rx="12" fill={BG} />

    {/* Phone outline */}
    <rect x="75" y="10" width="110" height="160" rx="12" fill={BG} stroke={MUTED} strokeWidth="1.5" />

    {/* Status bar */}
    <rect x="85" y="18" width="90" height="12" rx="2" fill="transparent" />
    {/* Signal bars */}
    <rect x="88" y="26" width="2" height="3" fill={MUTED} />
    <rect x="91" y="24" width="2" height="5" fill={MUTED} />
    <rect x="94" y="22" width="2" height="7" fill={MUTED} />
    <rect x="97" y="20" width="2" height="9" fill={MUTED} />
    {/* Battery */}
    <rect x="160" y="22" width="12" height="6" rx="1" fill="none" stroke={MUTED} strokeWidth="0.8" />
    <rect x="161" y="23" width="8" height="4" rx="0.5" fill={SUCCESS} />

    {/* Wi-Fi heading */}
    <text x="130" y="46" textAnchor="middle" fill={TEXT} fontSize="12" fontWeight="bold" fontFamily="sans-serif">
      Wi-Fi
    </text>

    {/* Network list */}
    {/* Highlighted network */}
    <rect x="85" y="54" width="90" height="22" rx="4" fill={ACCENT} opacity="0.15" stroke={ACCENT} strokeWidth="1" />
    {/* Lock icon (open) */}
    <rect x="90" y="62" width="6" height="5" rx="1" fill="none" stroke={ACCENT} strokeWidth="0.8" />
    <path d="M91 62 V60 A2 2 0 0 1 95 60" fill="none" stroke={ACCENT} strokeWidth="0.8" />
    {/* SSID text */}
    <text x="100" y="68" fill={ACCENT} fontSize="7" fontWeight="bold" fontFamily="monospace">
      mushpi-provision
    </text>
    {/* Signal bars (full) */}
    <rect x="163" y="66" width="2" height="3" fill={ACCENT} />
    <rect x="166" y="64" width="2" height="5" fill={ACCENT} />
    <rect x="169" y="62" width="2" height="7" fill={ACCENT} />

    {/* Other networks */}
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x="85" y={80 + i * 22} width="90" height="18" rx="4" fill="transparent" stroke={BOARD_BORDER} strokeWidth="0.5" />
        {/* Lock icon (closed) */}
        <rect x="90" y={87 + i * 22} width="6" height="5" rx="1" fill="none" stroke={MUTED} strokeWidth="0.8" />
        <path d={`M91 ${87 + i * 22} V${85 + i * 22} A2 2 0 0 1 95 ${85 + i * 22} V${87 + i * 22}`} fill="none" stroke={MUTED} strokeWidth="0.8" />
        {/* Network name placeholder */}
        <rect x="100" y={88 + i * 22} width={40 + i * 8} height="4" rx="1" fill={MUTED} opacity="0.4" />
        {/* Signal bars (partial) */}
        <rect x="163" y={90 + i * 22} width="2" height="3" fill={MUTED} opacity={0.6 - i * 0.15} />
        <rect x="166" y={88 + i * 22} width="2" height="5" fill={MUTED} opacity={0.6 - i * 0.15} />
        {i < 2 && <rect x="169" y={86 + i * 22} width="2" height="7" fill={MUTED} opacity={0.4 - i * 0.1} />}
      </g>
    ))}
  </svg>
);

export const OpenBrowserIllustration: React.FC<IllustrationProps> = ({
  width = 260,
  height = 180,
}) => (
  <svg
    viewBox="0 0 260 180"
    width={width}
    height={height}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Browser window showing provisioning URL"
  >
    {/* Background */}
    <rect width="260" height="180" rx="12" fill={BG} />

    {/* Browser window */}
    <rect x="20" y="15" width="220" height="150" rx="8" fill={BOARD_BG} stroke={BOARD_BORDER} strokeWidth="1.5" />

    {/* Title bar */}
    <rect x="20" y="15" width="220" height="24" rx="8" fill={BOARD_BORDER} />
    <rect x="20" y="31" width="220" height="8" fill={BOARD_BORDER} />
    {/* Window dots */}
    <circle cx="34" cy="27" r="4" fill="#e74c3c" opacity="0.7" />
    <circle cx="46" cy="27" r="4" fill="#f39c12" opacity="0.7" />
    <circle cx="58" cy="27" r="4" fill={SUCCESS} opacity="0.7" />

    {/* Address bar */}
    <rect x="70" y="20" width="160" height="14" rx="4" fill={BG} stroke={ACCENT} strokeWidth="1" />
    <text x="150" y="30" textAnchor="middle" fill={ACCENT} fontSize="7.5" fontFamily="monospace" fontWeight="bold">
      http://192.168.4.1:5000
    </text>

    {/* Page content area */}
    {/* Logo area */}
    <circle cx="130" cy="65" r="12" fill={ACCENT} opacity="0.2" stroke={ACCENT} strokeWidth="1" />
    <text x="130" y="69" textAnchor="middle" fill={ACCENT} fontSize="10" fontWeight="bold" fontFamily="sans-serif">
      M
    </text>

    {/* Input fields */}
    <rect x="65" y="88" width="130" height="14" rx="3" fill={BG} stroke={MUTED} strokeWidth="0.8" />
    <text x="75" y="98" fill={MUTED} fontSize="7" fontFamily="sans-serif" opacity="0.6">
      Wi-Fi SSID
    </text>

    <rect x="65" y="108" width="130" height="14" rx="3" fill={BG} stroke={MUTED} strokeWidth="0.8" />
    <text x="75" y="118" fill={MUTED} fontSize="7" fontFamily="sans-serif" opacity="0.6">
      Password
    </text>

    {/* Submit button */}
    <rect x="90" y="130" width="80" height="18" rx="4" fill={ACCENT} />
    <text x="130" y="142" textAnchor="middle" fill={TEXT} fontSize="8" fontWeight="bold" fontFamily="sans-serif">
      Connect
    </text>
  </svg>
);

export const SuccessIllustration: React.FC<IllustrationProps> = ({
  width = 260,
  height = 180,
}) => (
  <svg
    viewBox="0 0 260 180"
    width={width}
    height={height}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Success - Pico connected"
  >
    {/* Background */}
    <rect width="260" height="180" rx="12" fill={BG} />

    {/* Large checkmark circle */}
    <circle cx="130" cy="65" r="30" fill={SUCCESS} opacity="0.15" stroke={SUCCESS} strokeWidth="2" />
    {/* Checkmark */}
    <path d="M115 65 L126 76 L147 55" stroke={SUCCESS} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />

    {/* Pico board icon (simplified) */}
    <rect x="55" y="110" width="50" height="30" rx="4" fill={BOARD_BG} stroke={BOARD_BORDER} strokeWidth="1" />
    <rect x="50" y="118" width="8" height="10" rx="1" fill="#888" />
    {/* Tiny LED on board */}
    <circle cx="92" cy="118" r="2.5" fill={SUCCESS} />

    {/* Wi-Fi waves going to board */}
    <path d="M125 120 Q135 110 145 120" fill="none" stroke={ACCENT} strokeWidth="1.5" opacity="0.4" />
    <path d="M120 125 Q135 108 150 125" fill="none" stroke={ACCENT} strokeWidth="1.5" opacity="0.6" />
    <path d="M115 130 Q135 105 155 130" fill="none" stroke={ACCENT} strokeWidth="1.5" opacity="0.8" />

    {/* Router / signal source */}
    <rect x="155" y="115" width="30" height="20" rx="3" fill={BOARD_BG} stroke={BOARD_BORDER} strokeWidth="1" />
    <circle cx="170" cy="120" r="2" fill={ACCENT} />
    {/* Antenna */}
    <line x1="170" y1="115" x2="170" y2="108" stroke={MUTED} strokeWidth="1" />
    <circle cx="170" cy="106" r="2" fill={ACCENT} opacity="0.6" />

    {/* Connected text */}
    <text x="130" y="162" textAnchor="middle" fill={SUCCESS} fontSize="12" fontWeight="bold" fontFamily="sans-serif">
      Connected!
    </text>
  </svg>
);
