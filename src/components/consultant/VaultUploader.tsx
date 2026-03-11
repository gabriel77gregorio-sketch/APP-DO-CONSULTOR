import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function VaultUploader({ clientId }: { clientId: string }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError('Arquivo muito grande. Limite: 50MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const filePath = `${clientId}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      
      const { error: uploadError } = await supabase.storage
        .from('vault')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from('documents').insert({
        client_id: clientId,
        name: file.name,
        storage_path: filePath,
        file_size: file.size,
        file_type: file.type
      });

      if (dbError) throw dbError;

      // Recarrega a página para mostrar o novo documento
      window.location.reload();
    } catch (err: any) {
      setError('Erro ao enviar: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      {error && (
        <div className="mb-2 px-3 py-2 rounded-xl text-red-400 text-xs bg-red-500/10 border border-red-500/20">
          ⚠️ {error}
        </div>
      )}
      <label 
        className={`flex flex-col items-center justify-center w-full p-4 rounded-xl transition-all ${uploading ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}
        style={{ border: '2px dashed rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.04)' }}
        onMouseEnter={(e) => !uploading && (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.6)')}
        onMouseLeave={(e) => !uploading && (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)')}
      >
        <span className="text-2xl mb-1">{uploading ? '⏳' : '📁'}</span>
        <span className="text-slate-400 text-xs text-center">
          {uploading ? 'Enviando arquivo...' : 'Clique para enviar um documento'}
        </span>
        <input 
          type="file" 
          className="hidden" 
          onChange={handleUpload} 
          disabled={uploading}
        />
      </label>
    </div>
  );
}
