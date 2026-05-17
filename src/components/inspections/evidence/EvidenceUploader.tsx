import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ApiCallError } from '@/lib/api/client';
import type { EvidenceType } from '@/lib/checklists/types';
import type { Evidence, EvidenceTarget } from '@/lib/evidences/types';
import { uploadEvidence, type UploadStep } from '@/lib/evidences/upload';

interface EvidenceUploaderProps {
  target: EvidenceTarget;
  /** Tipo padrão da evidência (photo / document / signature / ...). */
  defaultType: EvidenceType;
  /**
   * Se omitido, a galeria mostra imagens. Reservado pra evolução
   * (vídeo / docs) — hoje só `images` é suportado pelo MVP.
   */
  accept?: 'images' | 'videos' | 'all';
  disabled?: boolean;
  onUploaded?: (evidence: Evidence) => void;
}

const STEP_LABEL: Record<UploadStep, string> = {
  hashing: 'Calculando hash…',
  uploading: 'Enviando arquivo…',
  confirming: 'Confirmando…',
};

function inferMime(asset: ImagePicker.ImagePickerAsset): string {
  if (asset.mimeType) return asset.mimeType;
  if (asset.type === 'video') return 'video/mp4';
  const uri = asset.uri.toLowerCase();
  if (uri.endsWith('.png')) return 'image/png';
  if (uri.endsWith('.heic')) return 'image/heic';
  if (uri.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function inferFileName(asset: ImagePicker.ImagePickerAsset, mime: string): string {
  if (asset.fileName && asset.fileName.length > 0) return asset.fileName;
  const ext =
    mime === 'image/png'
      ? 'png'
      : mime === 'image/heic'
        ? 'heic'
        : mime === 'image/webp'
          ? 'webp'
          : mime === 'video/mp4'
            ? 'mp4'
            : 'jpg';
  const stamp = Date.now();
  return `evidence-${stamp}.${ext}`;
}

export function EvidenceUploader({
  target,
  defaultType,
  disabled,
  onUploaded,
}: EvidenceUploaderProps) {
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<UploadStep | null>(null);

  const runWithAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    const mimeType = inferMime(asset);
    const fileName = inferFileName(asset, mimeType);
    const fileSize = typeof asset.fileSize === 'number' ? asset.fileSize : 0;
    setBusy(true);
    setStep('hashing');
    try {
      const evidence = await uploadEvidence({
        uri: asset.uri,
        fileName,
        mimeType,
        fileSize,
        type: defaultType,
        target,
        onProgress: setStep,
      });
      onUploaded?.(evidence);
      Alert.alert('OK', 'Evidência enviada.');
    } catch (err) {
      const msg =
        err instanceof ApiCallError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Falha ao enviar evidência.';
      Alert.alert('Erro', msg);
    } finally {
      setBusy(false);
      setStep(null);
    }
  };

  const pickFromCamera = async () => {
    if (busy || disabled) return;
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permissão necessária',
        'Conceda acesso à câmera para tirar fotos.',
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;
    await runWithAsset(asset);
  };

  const pickFromLibrary = async () => {
    if (busy || disabled) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;
    await runWithAsset(asset);
  };

  const isDisabled = disabled || busy;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable
          onPress={pickFromCamera}
          disabled={isDisabled}
          style={({ pressed }) => [
            styles.btn,
            pressed && !isDisabled && styles.btnPressed,
            isDisabled && styles.btnDisabled,
          ]}
        >
          <Text style={styles.btnLabel}>Camera</Text>
        </Pressable>
        <Pressable
          onPress={pickFromLibrary}
          disabled={isDisabled}
          style={({ pressed }) => [
            styles.btn,
            pressed && !isDisabled && styles.btnPressed,
            isDisabled && styles.btnDisabled,
          ]}
        >
          <Text style={styles.btnLabel}>Galeria</Text>
        </Pressable>
      </View>
      {step ? <Text style={styles.stepText}>{STEP_LABEL[step]}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  row: { flexDirection: 'row', gap: 8 },
  btn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  btnPressed: { backgroundColor: '#f1f5f9' },
  btnDisabled: { opacity: 0.5 },
  btnLabel: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  stepText: { fontSize: 12, color: '#64748b', fontStyle: 'italic' },
});
