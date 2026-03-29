import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit3, Plus, Save, X, ChevronDown, ChevronUp, Users } from 'lucide-react';
import AppNavbar from '@/components/AppNavbar';
import { loadCandidates, deleteCandidate, updateCandidate } from '@/lib/candidateStore';

const ease = [0.16, 1, 0.3, 1] as const;

interface StoredCandidate {
  name: string;
  role: string;
  source: string;
  [key: string]: any;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<StoredCandidate[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editJson, setEditJson] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    setCandidates(loadCandidates());
  }, []);

  const handleDelete = (name: string) => {
    const updated = deleteCandidate(name);
    setCandidates(updated);
    setConfirmDelete(null);
  };

  const startEdit = (c: StoredCandidate) => {
    setEditingId(c.name);
    setEditJson(JSON.stringify(c, null, 2));
    setJsonError('');
    setExpandedId(c.name);
  };

  const saveEdit = (originalName: string) => {
    try {
      const parsed = JSON.parse(editJson);
      if (!parsed.name || !parsed.role) {
        setJsonError('Name and role are required.');
        return;
      }
      const updated = updateCandidate(originalName, parsed);
      setCandidates(updated);
      setEditingId(null);
      setJsonError('');
    } catch {
      setJsonError('Invalid JSON format.');
    }
  };

  const sourceColor = (source: string) =>
    source === 'internal'
      ? 'bg-success-light text-success'
      : 'bg-brand-light text-brand';

  return (
    <div className="min-h-screen bg-[hsl(var(--color-bg))]">
      <AppNavbar />

      <div className="max-w-[960px] mx-auto px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1
              style={{ fontFamily: 'var(--font-display)' }}
              className="text-[32px] md:text-[42px] text-t-primary leading-[1.1]"
            >
              Candidate Dashboard
            </h1>
            <p
              style={{ fontFamily: 'var(--font-body)' }}
              className="text-[15px] text-t-secondary mt-2 leading-[1.6]"
            >
              {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} in your database.
            </p>
          </div>
          <button
            onClick={() => navigate('/internal')}
            className="flex items-center gap-2 bg-brand text-white px-5 py-3 rounded-xl text-[14px] font-medium hover:bg-brand-hover hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 shrink-0"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <Plus size={16} />
            Add Candidate
          </button>
        </motion.div>

        {/* Empty state */}
        {candidates.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <Users size={48} className="mx-auto text-t-tertiary mb-4" />
            <p style={{ fontFamily: 'var(--font-body)' }} className="text-[16px] text-t-secondary">No candidates yet.</p>
            <button
              onClick={() => navigate('/internal')}
              className="mt-4 text-brand font-medium text-[14px] hover:underline"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Upload your first candidate →
            </button>
          </motion.div>
        )}

        {/* Candidate list */}
        <div className="space-y-3">
          <AnimatePresence>
            {candidates.map((c, i) => {
              const isExpanded = expandedId === c.name;
              const isEditing = editingId === c.name;

              return (
                <motion.div
                  key={c.name + i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30, height: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.04, ease }}
                  layout
                  className="bg-surface border border-brd rounded-2xl overflow-hidden hover:border-brd-strong transition-all duration-200"
                >
                  {/* Row */}
                  <div
                    className="flex items-center gap-4 p-5 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : c.name)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span
                          style={{ fontFamily: 'var(--font-body)' }}
                          className="text-[15px] text-t-primary font-semibold truncate"
                        >
                          {c.name}
                        </span>
                        {c.source && (
                          <span
                            className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${sourceColor(c.source)}`}
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            {c.source}
                          </span>
                        )}
                      </div>
                      <p
                        style={{ fontFamily: 'var(--font-body)' }}
                        className="text-[13px] text-t-tertiary truncate mt-0.5"
                      >
                        {c.role}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); startEdit(c); }}
                        className="p-2 rounded-lg text-t-tertiary hover:text-brand hover:bg-brand-light transition-all duration-150"
                        title="Edit JSON"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(confirmDelete === c.name ? null : c.name); }}
                        className="p-2 rounded-lg text-t-tertiary hover:text-danger hover:bg-danger-light transition-all duration-150"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                      <div className="p-2 text-t-tertiary">
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </div>
                    </div>
                  </div>

                  {/* Delete confirmation */}
                  <AnimatePresence>
                    {confirmDelete === c.name && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-danger-light bg-danger-light overflow-hidden"
                      >
                        <div className="px-5 py-3 flex items-center justify-between">
                          <p style={{ fontFamily: 'var(--font-body)' }} className="text-[13px] text-danger font-medium">
                            Delete {c.name}? This cannot be undone.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-[13px] text-t-secondary px-3 py-1.5 rounded-lg hover:bg-surface transition-colors"
                              style={{ fontFamily: 'var(--font-body)' }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDelete(c.name)}
                              className="text-[13px] text-white bg-danger px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity font-medium"
                              style={{ fontFamily: 'var(--font-body)' }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expanded panel — JSON only */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease }}
                        className="border-t border-brd overflow-hidden"
                      >
                        <div className="p-5">
                          {isEditing ? (
                            <>
                              <div className="flex items-center justify-between mb-3">
                                <span style={{ fontFamily: 'var(--font-mono)' }} className="text-[12px] text-t-tertiary">
                                  Edit JSON — {c.name}
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => { setEditingId(null); setJsonError(''); }}
                                    className="flex items-center gap-1.5 text-[13px] text-t-secondary px-3 py-1.5 rounded-lg border border-brd hover:bg-surface-2 transition-all"
                                    style={{ fontFamily: 'var(--font-body)' }}
                                  >
                                    <X size={14} /> Cancel
                                  </button>
                                  <button
                                    onClick={() => saveEdit(c.name)}
                                    className="flex items-center gap-1.5 text-[13px] text-white bg-brand px-3 py-1.5 rounded-lg hover:bg-brand-hover transition-all font-medium"
                                    style={{ fontFamily: 'var(--font-body)' }}
                                  >
                                    <Save size={14} /> Save
                                  </button>
                                </div>
                              </div>
                              {jsonError && (
                                <p className="text-[12px] text-danger mb-2 font-medium" style={{ fontFamily: 'var(--font-body)' }}>{jsonError}</p>
                              )}
                              <textarea
                                value={editJson}
                                onChange={(e) => setEditJson(e.target.value)}
                                className="w-full min-h-[300px] bg-[#0F1117] text-white/80 text-[12px] leading-[1.8] rounded-xl p-5 outline-none resize-y border border-white/5 focus:border-brand/40 transition-colors"
                                style={{ fontFamily: 'var(--font-mono)' }}
                                spellCheck={false}
                              />
                            </>
                          ) : (
                            <pre
                              className="bg-[#0F1117] text-white/70 text-[12px] leading-[1.8] rounded-xl p-5 overflow-x-auto"
                              style={{ fontFamily: 'var(--font-mono)' }}
                            >
                              {JSON.stringify(c, null, 2)}
                            </pre>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
