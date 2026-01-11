import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';

type CameraMode = 'photo' | 'video';
type FlashMode = 'off' | 'on' | 'auto';

export type CameraCapture =
  | { type: 'image'; uri: string; width?: number; height?: number; exif?: any }
  | { type: 'video'; uri: string; duration?: number };

type Props = {
  visible: boolean;
  mode: CameraMode;
  onClose: () => void;
  onCaptured: (capture: CameraCapture) => void;
};

const CircleIconButton = ({
  icon,
  onPress,
  active,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.circleBtn,
        active ? styles.circleBtnActive : null,
        disabled ? { opacity: 0.5 } : null,
      ]}
    >
      <Ionicons name={icon} size={22} color='white' />
    </TouchableOpacity>
  );
};

function formatTimer(seconds: number) {
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  const mmStr = mm < 10 ? `0${mm}` : `${mm}`;
  const ssStr = ss < 10 ? `0${ss}` : `${ss}`;
  return `${mmStr}:${ssStr}`;
}

const InAppCameraModal: React.FC<Props> = ({
  visible,
  mode,
  onClose,
  onCaptured,
}) => {
  const isFocused = useIsFocused();
  const cameraRef = useRef<CameraView | null>(null);

  const [permission, requestPermission] = useCameraPermissions();

  const [isReady, setIsReady] = useState(false);
  const [canStop, setCanStop] = useState(false);

  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [torch, setTorch] = useState(false);
  const [zoom, setZoom] = useState(0);

  const [isBusy, setIsBusy] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  // Reset state when reopened
  useEffect(() => {
    if (visible) {
      setIsBusy(false);
      setIsRecording(false);
      setRecordSeconds(0);
      setZoom(0);
    }
  }, [visible]);

  useEffect(() => {
    setIsReady(false);
  }, [mode, facing, visible]);

  // Recording timer
  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  function clamp01(v: number) {
    return Math.max(0, Math.min(1, v));
  }

  const canRenderCamera = visible && isFocused;

  const flashIcon = useMemo(() => {
    if (flash === 'off') return 'flash-off-outline';
    if (flash === 'on') return 'flash-outline';
    return 'flash';
  }, [flash]);

  async function ensurePermission() {
    if (!permission) return false;
    if (permission.granted) return true;
    const res = await requestPermission();
    return !!res.granted;
  }

  function cycleFlash() {
    setFlash((prev) =>
      prev === 'off' ? 'on' : prev === 'on' ? 'auto' : 'off'
    );
  }

  function toggleFacing() {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  }

  async function takePhoto() {
    if (isBusy || isRecording) return;
    const ok = await ensurePermission();
    if (!ok) return;

    try {
      setIsBusy(true);

      const pic = await (cameraRef.current as any)?.takePictureAsync?.({
        quality: 1,
        exif: true,
        shutterSound: false,
        // Android kann bei manchen Geräten stabiler werden, wenn Processing übersprungen wird:
        skipProcessing: Platform.OS === 'android',
      });

      if (!pic?.uri) return;

      onCaptured({
        type: 'image',
        uri: pic.uri,
        width: pic.width,
        height: pic.height,
        exif: pic.exif,
      });
      onClose();
    } finally {
      setIsBusy(false);
    }
  }

  const recordPromiseRef = useRef<Promise<any> | null>(null);
  const stopTimeoutRef = useRef<any>(null);

  async function startVideo() {
    if (!cameraRef.current || !isReady || isRecording) return;

    const ok = await ensurePermission();
    if (!ok) return;

    setIsRecording(true);
    setCanStop(false);
    setRecordSeconds(0);

    stopTimeoutRef.current = setTimeout(() => setCanStop(true), 800);

    recordPromiseRef.current = (cameraRef.current as any)
      .recordAsync?.({ quality: '720p', maxDuration: 60 })
      .then((res: any) => {
        if (res?.uri) {
          onCaptured({ type: 'video', uri: res.uri });
          onClose();
        }
      })
      .catch((e: any) => console.log('recordAsync failed', e))
      .finally(() => {
        if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
        setCanStop(false);
        setIsRecording(false);
        recordPromiseRef.current = null;
      });
  }

  function stopVideo() {
    if (!cameraRef.current || !isRecording) return;
    if (!canStop) return;
    (cameraRef.current as any).stopRecording?.();
  }

  function onShutterPress() {
    if (mode === 'photo') return takePhoto();
    if (isRecording) return stopVideo();
    return startVideo();
  }

  if (!visible) return null;

  // Permissions loading
  if (!permission) {
    return (
      <Modal visible transparent animationType='fade' onRequestClose={onClose}>
        <View style={styles.centerOverlay}>
          <ActivityIndicator />
        </View>
      </Modal>
    );
  }

  // Permission not granted UI
  if (!permission.granted) {
    return (
      <Modal visible transparent animationType='fade' onRequestClose={onClose}>
        <SafeAreaView style={styles.permissionOverlay}>
          <Text style={styles.permissionTitle}>Camera access required</Text>
          <Text style={styles.permissionText}>
            Please allow access so you can take photos/videos.
          </Text>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <TouchableOpacity onPress={onClose} style={styles.permissionBtn}>
              <Text style={styles.permissionBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={requestPermission}
              style={[styles.permissionBtn, styles.permissionBtnPrimary]}
            >
              <Text style={styles.permissionBtnText}>Allow</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible animationType='slide' onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Camera */}
        {canRenderCamera ? (
          <CameraView
            ref={(r) => (cameraRef.current = r)}
            style={styles.camera}
            facing={facing}
            flash={flash}
            enableTorch={torch}
            mode={mode === 'video' ? 'video' : 'picture'}
            onCameraReady={() => setIsReady(true)}
            zoom={zoom}
            // active ist praktisch, falls du Modal nicht unmountest
            active={visible}
          />
        ) : (
          <View style={[styles.camera, styles.cameraPlaceholder]} />
        )}

        <View style={styles.zoomRail} pointerEvents='box-none'>
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={() => setZoom((z) => clamp01(z + 0.06))}
            disabled={isBusy}
          >
            <Ionicons name='add' size={18} color='white' />
          </TouchableOpacity>

          <View style={styles.zoomSliderWrap}>
            <Slider
              value={zoom}
              onValueChange={(v) => setZoom(clamp01(v))}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              disabled={isBusy}
              minimumTrackTintColor='white'
              maximumTrackTintColor='rgba(255,255,255,0.35)'
              thumbTintColor='white'
              style={styles.zoomSlider}
            />
          </View>

          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={() => setZoom((z) => clamp01(z - 0.06))}
            disabled={isBusy}
          >
            <Ionicons name='remove' size={18} color='white' />
          </TouchableOpacity>

          <View style={styles.zoomChip}>
            <Text style={styles.zoomChipText}>{Math.round(zoom * 100)}%</Text>
          </View>
        </View>

        {/* Top controls */}
        <SafeAreaView style={styles.topBar}>
          <CircleIconButton icon='close' onPress={onClose} disabled={isBusy} />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <CircleIconButton
              icon={flashIcon}
              onPress={cycleFlash}
              disabled={isBusy || isRecording}
              active={flash !== 'off'}
            />
            <CircleIconButton
              icon={torch ? 'flashlight' : 'flashlight-outline'}
              onPress={() => setTorch((p) => !p)}
              disabled={isBusy || isRecording}
              active={torch}
            />
            <CircleIconButton
              icon='camera-reverse-outline'
              onPress={toggleFacing}
              disabled={isBusy || isRecording}
            />
          </View>
        </SafeAreaView>

        {/* Recording badge */}
        {isRecording && (
          <View style={styles.recordBadge}>
            <View style={styles.recordDot} />
            <Text style={styles.recordText}>{formatTimer(recordSeconds)}</Text>
          </View>
        )}

        {/* Bottom controls */}
        <SafeAreaView style={styles.bottomBar}>
          {/* Controls row */}
          <View style={styles.controlsRow}>
            {/* Shutter */}
            <TouchableOpacity
              onPress={onShutterPress}
              disabled={isBusy}
              style={[
                styles.shutterOuter,
                mode === 'video' ? styles.shutterOuterVideo : null,
              ]}
            >
              <View
                style={[
                  styles.shutterInner,
                  isRecording ? styles.shutterInnerRecording : null,
                ]}
              />
            </TouchableOpacity>
          </View>

          {isBusy && (
            <View style={styles.busyOverlay}>
              <ActivityIndicator />
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 1 },
  cameraPlaceholder: { backgroundColor: '#000' },

  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.28)',
  },

  recordBadge: {
    position: 'absolute',
    top: 90,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  recordDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff3b30',
  },
  recordText: { color: 'white', fontWeight: '600' },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  zoomRail: {
    position: 'absolute',
    right: 12,
    top: 120,
    // damit es nicht mit BottomBar kollidiert:
    bottom: 160,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.28)',
    gap: 10,
  },

  zoomBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  zoomSliderWrap: {
    width: 44, // rail-breite
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Slider wird horizontal gerendert -> wir drehen ihn
  zoomSlider: {
    width: 220, // das wird nach Rotation zur Höhe
    height: 44,
    transform: [{ rotate: '-90deg' }],
  },

  zoomChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },

  zoomChipText: {
    color: 'white',
    fontWeight: '700',
  },

  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  shutterOuter: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 'auto',
  },
  shutterOuterVideo: {
    borderColor: 'rgba(255,255,255,0.9)',
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'white',
  },
  shutterInnerRecording: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ff3b30',
  },

  busyOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  permissionOverlay: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  permissionText: {
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  permissionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  permissionBtnPrimary: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  permissionBtnText: { color: 'white', fontWeight: '700' },
});

export default InAppCameraModal;
