import { useState, useRef, useEffect } from 'react';
import type { RoadmapStep, Task, Document } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

interface Props {
    steps: RoadmapStep[];
    tasks: Task[];
    documents: Document[];
    clientName: string;
    clientId: string;
    progress: number;
    accessToken?: string;
    refreshToken?: string;
    roadmapTitle?: string;
    roadmapSubtitle?: string;
    primaryColor?: string;
    logoUrl?: string;
}

const MONTH_COLORS: Record<string, string> = {
    'Mês 1': '#a78bfa',
    'Mês 2': '#60a5fa',
    'Mês 3': '#34d399',
    'Mês 4': '#f59e0b',
    'Mês 5': '#f97316',
    'Mês 6': '#ec4899',
};

function getMonthColor(monthLabel: string): string {
    const key = Object.keys(MONTH_COLORS).find(k => monthLabel.startsWith(k));
    return key ? MONTH_COLORS[key] : '#7c3aed';
}

function getFileIcon(fileType: string | null, name: string): string {
    if (!fileType) return '📎';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('sheet') || name.endsWith('.xlsx') || name.endsWith('.csv')) return '📊';
    if (fileType.includes('word') || name.endsWith('.docx')) return '📝';
    if (fileType.includes('presentation') || name.endsWith('.pptx')) return '📊';
    if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️';
    return '📎';
}

function ProgressRing({ progress, primaryColor }: { progress: number, primaryColor: string }) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width="140" height="140" className="-rotate-90">
                <circle cx="70" cy="70" r={radius} fill="none" strokeWidth="8"
                    stroke="rgba(255,255,255,0.06)" />
                <circle cx="70" cy="70" r={radius} fill="none" strokeWidth="8"
                    stroke={primaryColor}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
            </svg>
            <div className="absolute text-center">
                <span className="text-3xl font-bold text-slate-800">{progress}%</span>
                <span className="block text-xs text-slate-500">completo</span>
            </div>
        </div>
    );
}

export default function RoadmapTimeline({
    steps,
    tasks: initialTasks,
    documents: initialDocuments,
    clientName,
    clientId,
    progress,
    accessToken,
    refreshToken,
    roadmapTitle,
    roadmapSubtitle,
    primaryColor = '#7c3aed',
    logoUrl,
}: Props) {
    const [tasks, setTasks] = useState(initialTasks);
    const [documents, setDocuments] = useState(initialDocuments);
    const [activeStep, setActiveStep] = useState<string | null>(
        steps.find(s => s.status === 'current')?.id ?? null
    );
    const [activeTab, setActiveTab] = useState<'roadmap' | 'vault' | 'tasks'>('roadmap');

    // Autentica o cliente Supabase no browser com a sessão do usuário
    useEffect(() => {
        if (accessToken && refreshToken) {
            supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });
        }
    }, [accessToken, refreshToken]);

    // Onboarding Guiado para o Cliente
    useEffect(() => {
        if (!localStorage.getItem(`ob_client_view_${clientId}`)) {
            const driverObj = driver({
                showProgress: true,
                nextBtnText: 'Próximo →',
                prevBtnText: '← Anterior',
                doneBtnText: 'Entendi!',
                steps: [
                    {
                        element: '#client-hero-section',
                        popover: {
                            title: 'Bem-vindo ao seu Portal 🎉',
                            description: 'Aqui você acompanha toda a sua jornada da consultoria, seu progresso e seus próximos passos.',
                            side: "bottom",
                            align: 'center'
                        }
                    },
                    {
                        element: '#tabs-container',
                        popover: {
                            title: 'Navegação Simples',
                            description: 'Navegue entre o mapa da sua jornada, suas pendências e os documentos do projeto (cofre).',
                            side: "bottom",
                            align: 'center'
                        }
                    },
                    {
                        element: '#tab-tasks',
                        popover: {
                            title: 'Suas Pendências 📋',
                            description: 'Sempre que houver alguma tarefa que você precisa realizar, ela aparecerá aqui.',
                            side: "bottom",
                            align: 'center'
                        }
                    },
                    {
                        element: '#tab-vault',
                        popover: {
                            title: 'Cofre de Documentos 🗄️',
                            description: 'Todos os materiais entregues e trocados ficam seguros aqui. Você também pode enviar arquivos.',
                            side: "bottom",
                            align: 'center'
                        }
                    }
                ],
                onDestroyStarted: () => {
                    if (!driverObj.hasNextStep() || window.confirm("Deseja pular as dicas?")) {
                        localStorage.setItem(`ob_client_view_${clientId}`, 'true');
                        driverObj.destroy();
                    }
                },
            });

            setTimeout(() => driverObj.drive(), 800);
        }
    }, [clientId]);

    // Upload states
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const myTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    const toggleTask = async (taskId: string, current: boolean) => {
        const { error } = await supabase.from('tasks').update({ completed: !current }).eq('id', taskId);
        if (!error) {
            setTasks(ts => ts.map(t => t.id === taskId ? { ...t, completed: !current } : t));
        }
    };

    const getDownloadUrl = async (storagePath: string) => {
        const { data } = await supabase.storage.from('vault').createSignedUrl(storagePath, 300);
        if (data?.signedUrl) window.open(data.signedUrl, '_blank');
    };

    const handleFileUpload = async (file: File) => {
        if (!file || file.size === 0) return;

        // Limite de 50MB
        if (file.size > 52428800) {
            setUploadError('Arquivo muito grande. Limite: 50MB');
            return;
        }

        setUploading(true);
        setUploadError('');
        setUploadProgress(10);

        try {
            const storagePath = `${clientId}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

            setUploadProgress(40);

            const { error: storageError } = await supabase.storage
                .from('vault')
                .upload(storagePath, file, { contentType: file.type, upsert: false });

            if (storageError) {
                setUploadError(`Erro ao enviar: ${storageError.message}`);
                setUploading(false);
                setUploadProgress(0);
                return;
            }

            setUploadProgress(80);

            // Salva metadados na tabela documents
            const { data: docData, error: dbError } = await supabase
                .from('documents')
                .insert({
                    client_id: clientId,
                    name: file.name,
                    storage_path: storagePath,
                    file_size: file.size,
                    file_type: file.type,
                })
                .select()
                .single();

            setUploadProgress(100);

            if (!dbError && docData) {
                setDocuments(prev => [docData, ...prev]);
            }

            setTimeout(() => {
                setUploading(false);
                setUploadProgress(0);
            }, 800);
        } catch (err) {
            setUploadError('Erro inesperado. Tente novamente.');
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
        e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileUpload(file);
    };

    const currentStep = steps.find(s => s.status === 'current');

    return (
        <div>
            {/* Hero Section */}
            <div id="client-hero-section" className="glass p-6 md:p-8 mb-6 md:mb-8 text-center relative overflow-hidden" style={{ borderTop: `4px solid ${primaryColor}` }}>
                {logoUrl ? (
                    <img src={logoUrl} alt={clientName} className="h-12 w-auto mx-auto mb-4 object-contain rounded-lg" />
                ) : (
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-slate-800 shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${primaryColor}80, ${primaryColor})` }}>
                        {clientName.charAt(0).toUpperCase()}
                    </div>
                )}
                
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at center, ${primaryColor}15 0%, transparent 70%)` }} />
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">{roadmapTitle || 'Jornada dos 12 Checkpoints'}</h1>
                <p className="text-slate-600 text-sm md:text-base font-medium mb-1">{clientName}</p>
                <p className="text-slate-500 text-xs md:text-sm mb-6">{roadmapSubtitle || 'Um plano de desenvolvimento personalizado'}</p>
                <div className="flex justify-center mb-4">
                    <ProgressRing progress={progress} primaryColor={primaryColor} />
                </div>
                {currentStep && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                        style={{ color: primaryColor, background: `${primaryColor}15`, border: `1px solid ${primaryColor}40` }}>
                        🔵 Em andamento: Checkpoint {currentStep.step_number} — {currentStep.title}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div id="tabs-container" className="flex flex-nowrap overflow-x-auto gap-1 mb-6 p-1 rounded-xl no-scrollbar"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {([
                    { key: 'roadmap', label: '🗺️ Minha Jornada' },
                    { key: 'tasks', label: `📋 Pendências${myTasks.length > 0 ? ` (${myTasks.length})` : ''}` },
                    { key: 'vault', label: `🗄️ Cofre (${documents.length})` },
                ] as { key: 'roadmap' | 'vault' | 'tasks'; label: string }[]).map(tab => (
                    <button
                        key={tab.key}
                        id={`tab-${tab.key}`}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 min-w-[max-content] px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.key ? 'text-slate-800' : 'text-slate-500 hover:text-slate-600'
                            }`}
                        style={activeTab === tab.key ? { background: `${primaryColor}30`, color: primaryColor } : {}}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ===== Tab: Roadmap ===== */}
            {activeTab === 'roadmap' && (
                <div className="space-y-3">
                    {steps.map((step, idx) => {
                        const color = getMonthColor(step.month_label);
                        const isActive = activeStep === step.id;
                        const stepTasks = tasks.filter(t => t.step_number === step.step_number);

                        return (
                            <div key={step.id} className="relative" style={{ opacity: step.status === 'locked' ? 0.4 : 1 }}>
                                {/* Linha de tempo */}
                                {idx < steps.length - 1 && (
                                    <div className="absolute left-5 top-16 w-0.5 h-full z-0"
                                        style={{ background: step.status === 'completed' ? color : 'rgba(255,255,255,0.08)' }} />
                                )}

                                <button
                                    className="w-full text-left glass transition-all duration-300 relative z-10"
                                    onClick={() => step.status !== 'locked' && setActiveStep(isActive ? null : step.id)}
                                    style={
                                        step.status === 'current'
                                            ? { borderColor: 'rgba(59,130,246,0.4)' }
                                            : step.status === 'completed'
                                                ? { borderColor: `${color}30` }
                                                : {}
                                    }
                                >
                                    <div className="flex items-center gap-4 p-4">
                                        {/* Ícone */}
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                                            style={{
                                                background:
                                                    step.status === 'completed'
                                                        ? `${color}20`
                                                        : step.status === 'current'
                                                            ? 'rgba(59,130,246,0.15)'
                                                            : 'rgba(255,255,255,0.04)',
                                                color:
                                                    step.status === 'completed'
                                                        ? color
                                                        : step.status === 'current'
                                                            ? '#60a5fa'
                                                            : '#475569',
                                                border: `1px solid ${step.status === 'completed'
                                                        ? `${color}40`
                                                        : step.status === 'current'
                                                            ? 'rgba(59,130,246,0.35)'
                                                            : 'rgba(255,255,255,0.06)'
                                                    }`,
                                            }}>
                                            {step.status === 'completed' ? '✓' : step.step_number}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-xs text-slate-500 mb-0.5">{step.month_label}</p>
                                            <h3 className={`font-semibold text-sm ${step.status === 'locked' ? 'text-slate-600' : 'text-slate-800'}`}>
                                                Checkpoint {step.step_number}: {step.title}
                                            </h3>
                                        </div>

                                        {step.status !== 'locked' && (
                                            <span className={`text-slate-500 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}>▼</span>
                                        )}
                                        {step.status === 'locked' && <span className="text-slate-700 text-lg">🔒</span>}
                                    </div>

                                    {/* Expandido */}
                                    {isActive && step.status !== 'locked' && (
                                        <div className="border-t border-slate-200 px-4 pb-4 pt-3 text-left space-y-4">
                                            <p className="text-slate-500 text-sm">{step.description}</p>

                                            {/* Checkmarks */}
                                            {step.checkmarks.length > 0 && (
                                                <div>
                                                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Objetivos do Checkpoint</p>
                                                    <div className="space-y-1.5">
                                                        {step.checkmarks.map((c, i) => (
                                                            <div key={i} className="flex items-center gap-2">
                                                                <span className={`text-base flex-shrink-0 ${c.checked ? 'text-green-400' : 'text-slate-600'}`}>
                                                                    {c.checked ? '✅' : '⬜'}
                                                                </span>
                                                                <span className={`text-sm ${c.checked ? 'line-through text-slate-500' : 'text-slate-600'}`}>
                                                                    {c.label}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Notas do consultor */}
                                            {step.notes && (
                                                <div className="p-3 rounded-xl"
                                                    style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                                                    <p className="text-xs font-semibold mb-1" style={{ color: '#a78bfa' }}>📝 Nota do Consultor</p>
                                                    <p className="text-slate-600 text-sm">{step.notes}</p>
                                                </div>
                                            )}

                                            {/* Link de entrega */}
                                            {step.delivery_url && (
                                                <a href={step.delivery_url} target="_blank" rel="noopener"
                                                    className="inline-flex items-center gap-2 text-sm transition-colors"
                                                    style={{ color: '#a78bfa' }}>
                                                    🔗 Ver Entrega
                                                </a>
                                            )}

                                            {/* Pendências do step */}
                                            {stepTasks.length > 0 && (
                                                <div>
                                                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Suas Pendências</p>
                                                    <div className="space-y-1.5">
                                                        {stepTasks.map(task => (
                                                            <label key={task.id} className="flex items-center gap-2.5 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={task.completed}
                                                                    onChange={() => toggleTask(task.id, task.completed)}
                                                                    className="w-4 h-4 accent-amber-500"
                                                                />
                                                                <span className={`text-sm ${task.completed ? 'line-through text-slate-600' : 'text-slate-600'}`}>
                                                                    {task.description}
                                                                    {task.due_date && (
                                                                        <span className="block text-[10px] text-amber-500/70 mt-0.5 font-medium">
                                                                            📅 Vence em: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ===== Tab: Pendências ===== */}
            {activeTab === 'tasks' && (
                <div className="glass p-6">
                    <h3 className="text-slate-800 font-bold mb-4">📋 Minhas Pendências</h3>
                    {myTasks.length === 0 && completedTasks.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-4xl mb-3">🎉</p>
                            <p className="text-slate-500 text-sm">Nenhuma pendência atribuída ainda</p>
                            <p className="text-slate-600 text-xs mt-1">Seu consultor criará tarefas conforme os checkpoints evoluem</p>
                        </div>
                    )}
                    {myTasks.length > 0 && (
                        <div className="space-y-2 mb-5">
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Em aberto</p>
                            {myTasks.map(task => (
                                <label key={task.id} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
                                    style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                                    <input type="checkbox" checked={false} onChange={() => toggleTask(task.id, false)}
                                        className="w-4 h-4 accent-amber-500 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-slate-200 text-sm font-medium">{task.description}</p>
                                        {task.due_date && (
                                            <p className="text-[10px] text-amber-500/70 mt-0.5">
                                                📅 Vence em: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                                            </p>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                    {completedTasks.length > 0 && (
                        <div className="space-y-2 opacity-50">
                            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider mb-2">Concluídas</p>
                            {completedTasks.map(task => (
                                <label key={task.id} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <input type="checkbox" checked={true} onChange={() => toggleTask(task.id, true)}
                                        className="w-4 h-4 accent-amber-500 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-slate-600 text-sm line-through font-medium">{task.description}</p>
                                        {task.due_date && (
                                            <p className="text-[10px] text-slate-700 mt-0.5">
                                                📅 Venceu em: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                                            </p>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ===== Tab: Cofre ===== */}
            {activeTab === 'vault' && (
                <div className="glass p-6">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="text-slate-800 font-bold">🗄️ Cofre de Documentos</h3>
                            <p className="text-slate-500 text-xs mt-0.5">Materiais da consultoria e arquivos enviados por você</p>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="btn-primary text-xs px-3 py-2 disabled:opacity-50"
                        >
                            {uploading ? '⏳ Enviando...' : '+ Adicionar Arquivo'}
                        </button>
                    </div>

                    {/* Input hidden */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip,.txt,.csv"
                    />

                    {/* Barra de progresso de upload */}
                    {uploading && (
                        <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs text-slate-500">Enviando arquivo...</span>
                                <span className="text-xs font-bold" style={{ color: '#a78bfa' }}>{uploadProgress}%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${uploadProgress}%`, transition: 'width 0.3s ease' }} />
                            </div>
                        </div>
                    )}

                    {/* Erro de upload */}
                    {uploadError && (
                        <div className="mb-4 px-4 py-3 rounded-xl text-red-400 text-xs"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                            ⚠️ {uploadError}
                        </div>
                    )}

                    {/* Área de drag & drop */}
                    <div
                        className="mb-5 rounded-xl p-6 text-center cursor-pointer transition-all"
                        style={{
                            border: `2px dashed ${dragOver ? 'rgba(124,58,237,0.7)' : 'rgba(124,58,237,0.25)'}`,
                            background: dragOver ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.03)',
                        }}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <p className="text-2xl mb-1">📂</p>
                        <p className="text-slate-500 text-xs">Arraste um arquivo ou <span style={{ color: '#a78bfa' }}>clique para selecionar</span></p>
                        <p className="text-slate-600 text-xs mt-1">PDF, Word, Excel, PowerPoint, imagens · Máx. 50MB</p>
                    </div>

                    {/* Lista de documentos */}
                    {documents.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-slate-600 text-sm">Nenhum documento ainda</p>
                            <p className="text-slate-700 text-xs mt-1">Envie arquivos da consultoria ou faça upload acima</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {documents.map(doc => (
                                <button
                                    key={doc.id}
                                    onClick={() => getDownloadUrl(doc.storage_path)}
                                    className="flex items-center gap-3 p-4 rounded-xl text-left glass-hover group"
                                >
                                    <span className="text-2xl flex-shrink-0">
                                        {getFileIcon(doc.file_type, doc.name)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-slate-200 text-sm font-medium truncate">{doc.name}</p>
                                        <p className="text-slate-500 text-xs">
                                            {doc.file_size ? `${(doc.file_size / 1024).toFixed(0)} KB · ` : ''}
                                            {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <span className="text-slate-600 group-hover:text-brand-400 transition-colors text-sm flex-shrink-0">⬇</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
