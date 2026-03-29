import { useState, useCallback } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppNavbar from '@/components/AppNavbar';

interface UploadedFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'done' | 'error';
  result?: any;
  error?: string;
}

export default function Candidates() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles: UploadedFile[] = Array.from(fileList)
      .filter(f => f.type === 'application/pdf')
      .map(f => ({
        id: crypto.randomUUID(),
        file: f,
        status: 'pending' as const,
      }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const processFiles = async () => {
    for (const f of files) {
      if (f.status !== 'pending') continue;
      setFiles(prev => prev.map(pf => pf.id === f.id ? { ...pf, status: 'processing' } : pf));

      // Mock processing — simulates AI extracting JSON from PDF
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));

      const mockResult = {
        name: f.file.name.replace('.pdf', '').replace(/[_-]/g, ' '),
        role: 'Senior Director, Operations',
        source: Math.random() > 0.5 ? 'internal' : 'external',
        experience_years: Math.floor(8 + Math.random() * 20),
        key_competencies: [
          'Operational Leadership',
          'Crisis Management',
          'P&L Ownership',
          'Stakeholder Management',
        ],
        education: 'MBA, Technical University Munich',
        languages: ['English', 'German'],
        extracted_at: new Date().toISOString(),
      };

      setFiles(prev => prev.map(pf =>
        pf.id === f.id ? { ...pf, status: 'done', result: mockResult } : pf
      ));
    }
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const doneCount = files.filter(f => f.status === 'done').length;

  return (
    <div className="min-h-screen bg-[hsl(var(--color-bg))]">
      <AppNavbar />

      <div className="max-w-[800px] mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-[32px] md:text-[42px] text-[hsl(var(--color-text-primary))] leading-[1.1]">
            Upload Candidate Profiles
          </h1>
          <p style={{ fontFamily: 'var(--font-body)' }} className="text-[16px] text-[hsl(var(--color-text-secondary))] mt-3 leading-[1.6] max-w-[520px]">
            Upload PDF resumes and our AI will extract structured candidate profiles as JSON documents, ready for analysis.
          </p>
        </motion.div>

        {/* Drop zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
          className={`mt-8 border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer ${
            dragOver
              ? 'border-[hsl(var(--color-accent))] bg-[hsl(var(--color-accent))]/5'
              : 'border-[hsl(var(--color-border-strong))] hover:border-[hsl(var(--color-accent))]/50 bg-[hsl(var(--color-surface))]'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.pdf';
            input.multiple = true;
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              if (target.files) addFiles(target.files);
            };
            input.click();
          }}
        >
          <Upload size={32} className="mx-auto text-[hsl(var(--color-text-tertiary))]" />
          <p style={{ fontFamily: 'var(--font-body)' }} className="text-[15px] text-[hsl(var(--color-text-primary))] font-medium mt-4">
            Drop PDF files here or click to browse
          </p>
          <p style={{ fontFamily: 'var(--font-body)' }} className="text-[13px] text-[hsl(var(--color-text-tertiary))] mt-1">
            Accepts .pdf files up to 20MB each
          </p>
        </motion.div>

        {/* File list */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 space-y-3"
            >
              {files.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-[hsl(var(--color-accent))]/10 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-[hsl(var(--color-accent))]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: 'var(--font-body)' }} className="text-[14px] text-[hsl(var(--color-text-primary))] font-medium truncate">
                      {f.file.name}
                    </p>
                    <p style={{ fontFamily: 'var(--font-mono)' }} className="text-[12px] text-[hsl(var(--color-text-tertiary))]">
                      {(f.file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>

                  {f.status === 'pending' && (
                    <button onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}>
                      <X size={16} className="text-[hsl(var(--color-text-tertiary))] hover:text-[hsl(var(--color-danger))] transition-colors" />
                    </button>
                  )}
                  {f.status === 'processing' && (
                    <Loader2 size={18} className="text-[hsl(var(--color-accent))] animate-spin" />
                  )}
                  {f.status === 'done' && (
                    <CheckCircle size={18} className="text-[hsl(var(--color-success))]" />
                  )}
                  {f.status === 'error' && (
                    <AlertCircle size={18} className="text-[hsl(var(--color-danger))]" />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Process button */}
        {pendingCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={processFiles}
            className="w-full mt-6 h-[52px] rounded-xl bg-[hsl(var(--color-text-primary))] text-[hsl(var(--color-bg))] font-medium text-[15px] hover:opacity-90 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Process {pendingCount} {pendingCount === 1 ? 'file' : 'files'} with AI →
          </motion.button>
        )}

        {/* Results */}
        <AnimatePresence>
          {doneCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-10"
            >
              <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-[24px] text-[hsl(var(--color-text-primary))]">
                Extracted Profiles
              </h2>
              <p style={{ fontFamily: 'var(--font-body)' }} className="text-[14px] text-[hsl(var(--color-text-secondary))] mt-1">
                {doneCount} candidate{doneCount !== 1 ? 's' : ''} processed
              </p>

              <div className="mt-4 space-y-4">
                {files.filter(f => f.status === 'done' && f.result).map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.08 }}
                    className="bg-[#0F1117] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.15)]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
                        <div className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
                        <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)' }} className="text-[12px] text-white/30">
                        {f.file.name.replace('.pdf', '.json')}
                      </span>
                    </div>
                    <div className="h-px bg-white/10 mb-4" />
                    <pre style={{ fontFamily: 'var(--font-mono)' }} className="text-[12px] leading-[1.8] text-white/80 overflow-x-auto">
                      {JSON.stringify(f.result, null, 2)}
                    </pre>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
