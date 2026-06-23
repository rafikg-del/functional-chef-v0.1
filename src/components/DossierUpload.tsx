'use client';

import { useCallback, useRef, useState } from 'react';
import type { UploadSummary } from '@/lib/training/types';

interface Props {
  onUploaded: (summary: UploadSummary) => void;
  onError: (msg: string) => void;
  disabled?: boolean;
}

export function DossierUpload({ onUploaded, onError, disabled }: Props) {
  const [batchName, setBatchName] = useState('');
  const [uploading, setUploading] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const uploadFormData = useCallback(
    async (formData: FormData) => {
      if (batchName.trim()) {
        formData.set('name', batchName.trim());
      }
      setUploading(true);
      onError('');
      try {
        const res = await fetch('/api/training/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        onUploaded(data as UploadSummary);
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Erreur upload');
      } finally {
        setUploading(false);
      }
    },
    [batchName, onError, onUploaded]
  );

  async function handleFolderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('files', f));
    await uploadFormData(formData);
    e.target.value = '';
  }

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('files', f));
    await uploadFormData(formData);
    e.target.value = '';
  }

  async function handleZipChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('zip', file);
    await uploadFormData(formData);
    e.target.value = '';
  }

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="font-serif text-xl text-ink-900 mb-1">Importer des dossiers patients</h2>
        <p className="text-sm text-ink-600">
          Chaque dossier doit contenir un fichier <code className="biomarker-value text-xs">profile.json</code>{' '}
          avec biomarqueurs, signaux cliniques et optionnellement{' '}
          <code className="biomarker-value text-xs">expected_dominant</code> (IR, INFLAM, DYSBIOSE).
        </p>
      </div>

      <div>
        <label className="label">Nom du lot d&apos;entraînement</label>
        <input
          type="text"
          value={batchName}
          onChange={(e) => setBatchName(e.target.value)}
          placeholder="Ex: Cohorte DU-MFL janvier 2026"
          className="input-field"
          disabled={disabled || uploading}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => folderInputRef.current?.click()}
          disabled={disabled || uploading}
          className="btn-primary text-sm py-3"
        >
          {uploading ? 'Import…' : 'Dossiers (multi)'}
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="btn-ghost text-sm py-3 border border-ink-200"
        >
          Fichiers JSON
        </button>
        <button
          type="button"
          onClick={() => zipInputRef.current?.click()}
          disabled={disabled || uploading}
          className="btn-ghost text-sm py-3 border border-ink-200"
        >
          Archive ZIP
        </button>
      </div>

      <input
        ref={folderInputRef}
        type="file"
        className="hidden"
        // @ts-expect-error webkitdirectory non typé dans React
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFolderChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".json,application/json"
        multiple
        onChange={handleFilesChange}
      />
      <input
        ref={zipInputRef}
        type="file"
        className="hidden"
        accept=".zip,application/zip"
        onChange={handleZipChange}
      />

      <p className="text-xs text-ink-500">
        Structure attendue : <span className="biomarker-value">patient-001/profile.json</span>,{' '}
        <span className="biomarker-value">patient-002/profile.json</span>, etc.
      </p>
    </div>
  );
}
