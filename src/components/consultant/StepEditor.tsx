import { useState, useCallback, useEffect } from 'react';
import type { RoadmapStep, Checkmark, Task } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';

interface Props {
    step: RoadmapStep;
    tasks: Task[];
    isInitiallyOpen?: boolean;
    accessToken?: string;
    refreshToken?: string;
}

const STATUS_LABELS = {
    locked: { label: 'Bloqueado', icon: '🔒', cls: 'badge-locked' },
    current: { label: 'Em Andamento', icon: '🔵', cls: 'badge-current' },
    completed: { label: 'Concluído', icon: '✅', cls: 'badge-completed' },
};

export default function StepEditor({ step: initialStep, tasks: initialTasks, isInitiallyOpen = false, accessToken, refreshToken }: Props) {
    const [step, setStep] = useState(initialStep);
    const [tasks, setTasks] = useState(initialTasks);
    const [isOpen, setIsOpen] = useState(isInitiallyOpen);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [newTask, setNewTask] = useState('');
    const [newDueDate, setNewDueDate] = useState('');
    const [addingTask, setAddingTask] = useState(false);
    const [newCheckmark, setNewCheckmark] = useState('');

    // Autentica o cliente Supabase no browser com a sessão do usuário
    useEffect(() => {
        if (accessToken && refreshToken) {
            supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });
        }
    }, [accessToken, refreshToken]);

    const saveStep = useCallback(async (updates: Partial<RoadmapStep>) => {
        setSaving(true);
        setSaveError('');
        const merged = { ...step, ...updates };
        setStep(merged);
        const { error } = await supabase
            .from('roadmap_steps')
            .update({
                notes: merged.notes,
                checkmarks: merged.checkmarks,
                delivery_url: merged.delivery_url,
                status: merged.status,
                title: merged.title,
                description: merged.description,
                month_label: merged.month_label,
                updated_at: new Date().toISOString(),
            })
            .eq('id', merged.id);
        setSaving(false);
        if (error) {
            setSaveError('Erro ao salvar: ' + error.message);
        } else {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    }, [step]);

    const deleteStep = async () => {
        if (!window.confirm('Tem certeza que deseja excluir este checkpoint permanentemente?')) return;
        setSaving(true);
        const { error } = await supabase.from('roadmap_steps').delete().eq('id', step.id);
        if (!error) {
            window.location.reload();
        } else {
            setSaveError('Erro ao excluir: ' + error.message);
            setSaving(false);
        }
    };

    const toggleCheckmark = async (index: number) => {
        const newCheckmarks: Checkmark[] = step.checkmarks.map((c, i) =>
            i === index ? { ...c, checked: !c.checked } : c
        );
        await saveStep({ checkmarks: newCheckmarks });
    };

    const deleteCheckmark = async (index: number) => {
        if (!window.confirm('Excluir este checkpoint?')) return;
        const newCheckmarks = step.checkmarks.filter((_, i) => i !== index);
        await saveStep({ checkmarks: newCheckmarks });
    };

    const addCheckmark = async () => {
        if (!newCheckmark.trim()) return;
        const newCheckmarks = [...step.checkmarks, { label: newCheckmark.trim(), checked: false }];
        await saveStep({ checkmarks: newCheckmarks });
        setNewCheckmark('');
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setStep((s) => ({ ...s, notes: e.target.value }));
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStep((s) => ({ ...s, delivery_url: e.target.value }));
    };

    const saveNotes = () => saveStep({ notes: step.notes, delivery_url: step.delivery_url });

    const advanceStatus = async () => {
        if (step.status === 'current') {
            await saveStep({ status: 'completed' });
        } else if (step.status === 'locked') {
            await saveStep({ status: 'current' });
        }
    };

    const addTask = async () => {
        if (!newTask.trim()) return;
        setAddingTask(true);
        const { data, error } = await supabase
            .from('tasks')
            .insert({
                client_id: step.client_id,
                step_number: step.step_number,
                description: newTask.trim(),
                completed: false,
                due_date: newDueDate || null,
            })
            .select()
            .single();
        if (!error && data) {
            setTasks((t) => [...t, data]);
            setNewTask('');
            setNewDueDate('');
        } else if (error) {
            setSaveError('Erro ao criar pendência: ' + error.message);
        }
        setAddingTask(false);
    };

    const toggleTask = async (taskId: string, current: boolean) => {
        const { error } = await supabase.from('tasks').update({ completed: !current }).eq('id', taskId);
        if (!error) {
            setTasks((ts) => ts.map((t) => t.id === taskId ? { ...t, completed: !current } : t));
        }
    };

    const deleteTask = async (taskId: string) => {
        const { error } = await supabase.from('tasks').delete().eq('id', taskId);
        if (!error) {
            setTasks((ts) => ts.filter(t => t.id !== taskId));
        }
    };

    const statusInfo = STATUS_LABELS[step.status];
    const checkedCount = step.checkmarks.filter(c => c.checked).length;

    return (
        <div className={`glass transition-all duration-300 ${step.status === 'current' ? 'border-blue-500/30' : step.status === 'completed' ? 'border-green-500/20' : ''}`}>
            {/* Header do step */}
            <button
                className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 text-left relative"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-start gap-4 flex-1 min-w-0 w-full pr-6 sm:pr-0">
                    {/* Número */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${step.status === 'completed'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : step.status === 'current'
                                ? 'border border-blue-500/40 text-blue-400'
                                : 'border border-slate-300 text-slate-600'
                        }`}
                        style={step.status === 'current' ? { background: 'rgba(59,130,246,0.12)' } : {}}>
                        {step.status === 'completed' ? '✓' : step.step_number}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${step.status === 'locked' ? 'text-slate-600' : 'text-slate-500'}`}
                                style={{ background: 'rgba(255,255,255,0.04)' }}>
                                {step.month_label}
                            </span>
                        </div>
                        <h3 className={`font-semibold text-sm sm:text-base leading-snug ${step.status === 'locked' ? 'text-slate-600' : 'text-slate-800'}`}>
                            Checkpoint {step.step_number}: {step.title}
                        </h3>
                        <p className={`text-xs mt-1 hidden sm:block ${step.status === 'locked' ? 'text-slate-700' : 'text-slate-500'}`}>
                            {step.description}
                        </p>
                    </div>
                </div>

                {/* Status badge + chevron */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto flex-shrink-0 pl-[56px] sm:pl-0 mt-1 sm:mt-0">
                    <div className="flex items-center gap-3">
                        <span className={statusInfo.cls}>{statusInfo.icon} {statusInfo.label}</span>
                        <span className="text-xs font-medium text-slate-500">{checkedCount}/{step.checkmarks.length}</span>
                    </div>
                    {/* Chevron: visível no mobile empilhado OU no desktop na fileira */}
                    <span className={`hidden sm:block text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                </div>
                
                {/* Chevron absolutizado para mobile (fica no canto superior direio) */}
                <span className={`sm:hidden absolute top-5 right-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {/* Conteúdo expansível */}
            {isOpen && (
                <div className="border-t border-slate-200 p-5 space-y-6 animate-fade-in">
                    {/* Erro de salvamento */}
                    {saveError && (
                        <div className="px-4 py-2 rounded-xl text-red-400 text-xs" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                            ⚠️ {saveError}
                        </div>
                    )}

                    {/* Configurações do Checkpoint */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                            ⚙️ Identificação do Checkpoint
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Título</label>
                                <input 
                                    className="input text-sm" 
                                    value={step.title} 
                                    onChange={(e) => setStep(s => ({...s, title: e.target.value}))}
                                    onBlur={() => saveStep({title: step.title})}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Mês/Etiqueta</label>
                                <input 
                                    className="input text-sm" 
                                    value={step.month_label} 
                                    onChange={(e) => setStep(s => ({...s, month_label: e.target.value}))}
                                    onBlur={() => saveStep({month_label: step.month_label})}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Descrição</label>
                            <textarea 
                                className="input text-sm w-full"
                                rows={2}
                                value={step.description} 
                                onChange={(e) => setStep(s => ({...s, description: e.target.value}))}
                                onBlur={() => saveStep({description: step.description})}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* Checkpoints */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                            ✓ Checkpoints da Reunião
                        </h4>
                        <div className="space-y-2 mb-3">
                            {step.checkmarks.map((check, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <label
                                        className={`flex-1 flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${check.checked ? 'bg-green-500/8' : 'hover:bg-white/3'
                                            }`}
                                        style={check.checked ? { border: '1px solid rgba(34,197,94,0.15)' } : { border: '1px solid rgba(255,255,255,0.04)' }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={check.checked}
                                            onChange={() => toggleCheckmark(idx)}
                                            className="w-4 h-4 accent-purple-500 flex-shrink-0"
                                        />
                                        <span className={`text-sm ${check.checked ? 'line-through text-slate-500' : 'text-slate-600'}`}>
                                            {check.label}
                                        </span>
                                    </label>
                                    <button 
                                        onClick={() => deleteCheckmark(idx)}
                                        className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                        title="Remover Checkpoint"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Novo checkpoint..."
                                value={newCheckmark}
                                onChange={(e) => setNewCheckmark(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addCheckmark()}
                                className="input text-sm flex-1"
                            />
                            <button 
                                onClick={addCheckmark}
                                disabled={!newCheckmark.trim()}
                                className="btn-primary text-sm px-4 whitespace-nowrap bg-slate-50 hover:bg-brand-500/20 text-brand-400 border-none rounded-xl"
                            >
                                + Add
                            </button>
                        </div>
                    </div>

                    {/* Central de Pendências (Tasks) */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                            📋 Pendências para o Cliente
                        </h4>
                        <div className="space-y-2 mb-3">
                            {tasks.length === 0 && (
                                <p className="text-slate-600 text-sm italic">Nenhuma pendência criada ainda</p>
                            )}
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${task.completed ? 'opacity-60' : ''}`}
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => toggleTask(task.id, task.completed)}
                                        className="w-4 h-4 accent-amber-500 flex-shrink-0"
                                    />
                                    <span className={`text-sm flex-1 ${task.completed ? 'line-through text-slate-600' : 'text-slate-600'}`}>
                                        {task.description}
                                        {task.due_date && (
                                            <span className="block text-[10px] text-amber-500/70 mt-0.5">
                                                📅 Vence em: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                                            </span>
                                        )}
                                    </span>
                                    <button
                                        onClick={() => deleteTask(task.id)}
                                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all text-xs"
                                        title="Remover pendência"
                                    >✕</button>
                                </div>
                            ))}
                        </div>
                        {/* Add task */}
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !addingTask && addTask()}
                                    placeholder="Nova pendência para o cliente..."
                                    className="input flex-1 text-sm"
                                />
                                <button
                                    onClick={addTask}
                                    disabled={addingTask || !newTask.trim()}
                                    className="btn-primary px-4 disabled:opacity-50"
                                >
                                    {addingTask ? '⏳' : '+'}
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-[10px] text-slate-500 uppercase font-bold">Prazo:</label>
                                <input
                                    type="date"
                                    value={newDueDate}
                                    onChange={(e) => setNewDueDate(e.target.value)}
                                    className="input py-1 px-2 text-[10px] w-auto bg-slate-50 border-slate-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notas da reunião */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                            📝 Notas da Reunião
                        </h4>
                        <textarea
                            value={step.notes ?? ''}
                            onChange={handleNotesChange}
                            onBlur={saveNotes}
                            placeholder="Anotações, observações, decisões tomadas neste checkpoint..."
                            rows={3}
                            className="input resize-none text-sm"
                        />
                    </div>

                    {/* URL de evidência */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                            🔗 Link de Entrega (Drive, Notion, etc)
                        </h4>
                        <input
                            type="url"
                            value={step.delivery_url ?? ''}
                            onChange={handleUrlChange}
                            onBlur={saveNotes}
                            placeholder="https://..."
                            className="input text-sm"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="text-xs">
                            {saving && <span className="text-slate-500">💾 Salvando...</span>}
                            {saved && !saving && <span className="text-green-400">✅ Salvo!</span>}
                            {saveError && !saving && <span className="text-red-400 text-xs">{saveError}</span>}
                        </div>
                        <div className="flex gap-2">
                            {step.status === 'locked' && (
                                <button onClick={advanceStatus} className="btn-ghost text-xs">
                                    🔓 Iniciar Checkpoint
                                </button>
                            )}
                            {step.status === 'current' && (
                                <button onClick={advanceStatus} className="btn-primary text-xs">
                                    ✅ Validar Checkpoint
                                </button>
                            )}
                            {step.status === 'completed' && (
                                <span className="text-xs text-green-400 font-medium">Checkpoint concluído ✓</span>
                            )}
                            <button onClick={deleteStep} className="btn-ghost text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 ml-2">
                                🗑️ Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
