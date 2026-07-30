import React from 'react';

import joinWifiSvg from '~assets/JoinWifi.svg';
import ledBlinkSvg from '~assets/LedBlink.svg';
import openBrowserSvg from '~assets/OpenBrowser.svg';
import successConnectSvg from '~assets/SuccessConnect.svg';

interface IllustrationProps {
  width?: number;
  height?: number;
}

export const LedBlinkIllustration: React.FC<IllustrationProps> = ({
  width = 260,
  height = 180,
}) => <img src={ledBlinkSvg} alt="Pico board with blinking LED" width={width} height={height} />;

export const JoinWifiIllustration: React.FC<IllustrationProps> = ({
  width = 260,
  height = 180,
}) => <img src={joinWifiSvg} alt="Phone showing Wi-Fi settings" width={width} height={height} />;

export const OpenBrowserIllustration: React.FC<IllustrationProps> = ({
  width = 260,
  height = 180,
}) => (
  <img
    src={openBrowserSvg}
    alt="Browser window showing provisioning URL"
    width={width}
    height={height}
  />
);

export const SuccessIllustration: React.FC<IllustrationProps> = ({ width = 260, height = 180 }) => (
  <img src={successConnectSvg} alt="Success - Pico connected" width={width} height={height} />
);
