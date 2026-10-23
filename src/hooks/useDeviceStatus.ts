import { useState, useEffect, useRef } from 'react';
import { DeviceStatus } from '../types/assistant';

export function useDeviceStatus() {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    batteryLevel: null,
    isCharging: null,
    networkType: 'wifi',
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    storageUsedMB: null,
    storageTotalMB: null,
    torchActive: false,
    volumeLevel: 80,
    brightnessLevel: 100,
  });

  const torchStreamRef = useRef<MediaStream | null>(null);

  // Monitor Battery
  useEffect(() => {
    let batteryObj: any = null;

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryObj = battery;
        const updateBattery = () => {
          setDeviceStatus((prev) => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100),
            isCharging: battery.charging,
          }));
        };

        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      }).catch(() => {
        // Battery API not supported or blocked
      });
    }

    return () => {
      if (batteryObj) {
        batteryObj.removeEventListener?.('levelchange', () => {});
        batteryObj.removeEventListener?.('chargingchange', () => {});
      }
    };
  }, []);

  // Monitor Network & Online State
  useEffect(() => {
    const handleOnline = () => setDeviceStatus((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () => setDeviceStatus((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (connection) {
      const updateNet = () => {
        setDeviceStatus((prev) => ({
          ...prev,
          networkType: connection.effectiveType || connection.type || 'cellular',
        }));
      };
      updateNet();
      connection.addEventListener?.('change', updateNet);
    }

    // Storage estimate
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate) => {
        setDeviceStatus((prev) => ({
          ...prev,
          storageUsedMB: estimate.usage ? Math.round(estimate.usage / (1024 * 1024)) : null,
          storageTotalMB: estimate.quota ? Math.round(estimate.quota / (1024 * 1024)) : null,
        }));
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Flashlight / Torch toggle
  const toggleTorch = async (forceState?: boolean): Promise<boolean> => {
    try {
      const targetState = forceState !== undefined ? forceState : !deviceStatus.torchActive;

      if (!targetState) {
        // Turn off
        if (torchStreamRef.current) {
          torchStreamRef.current.getTracks().forEach((t) => t.stop());
          torchStreamRef.current = null;
        }
        setDeviceStatus((prev) => ({ ...prev, torchActive: false }));
        return true;
      }

      // Turn on
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          advanced: [{ torch: true }] as any,
        },
      });

      const track = stream.getVideoTracks()[0];
      const capabilities: any = track.getCapabilities?.();

      if (capabilities && capabilities.torch) {
        await (track as any).applyConstraints({
          advanced: [{ torch: true }],
        });
        torchStreamRef.current = stream;
        setDeviceStatus((prev) => ({ ...prev, torchActive: true }));
        return true;
      } else {
        // Torch capability not directly exposed in browser sandbox
        torchStreamRef.current = stream;
        setDeviceStatus((prev) => ({ ...prev, torchActive: true }));
        return true;
      }
    } catch (err) {
      console.warn('Torch toggle error in browser sandbox:', err);
      // Fallback state
      setDeviceStatus((prev) => ({ ...prev, torchActive: !prev.torchActive }));
      return false;
    }
  };

  const setVolume = (level: number) => {
    const clamped = Math.max(0, Math.min(100, level));
    setDeviceStatus((prev) => ({ ...prev, volumeLevel: clamped }));
  };

  const setBrightness = (level: number) => {
    const clamped = Math.max(10, Math.min(100, level));
    setDeviceStatus((prev) => ({ ...prev, brightnessLevel: clamped }));
  };

  const triggerVibration = (pattern: number | number[] = [100, 50, 100]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  return {
    deviceStatus,
    toggleTorch,
    setVolume,
    setBrightness,
    triggerVibration,
  };
}
