import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

if (!import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
    console.error('CRITICAL ERROR: Missing Supabase environment variables! Check Vercel project settings.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types
export type Profile = {
    id: string;
    full_name: string;
    avatar_url: string | null;
    created_at: string;
};

export type Client = {
    id: string;
    consultant_id: string;
    name: string;
    client_email: string;
    sector: string | null;
    logo_url: string | null;
    created_at: string;
};

export type Checkmark = {
    label: string;
    checked: boolean;
};

export type RoadmapStep = {
    id: string;
    client_id: string;
    step_number: number;
    title: string;
    description: string;
    month_label: string;
    status: 'locked' | 'current' | 'completed';
    notes: string | null;
    checkmarks: Checkmark[];
    delivery_url: string | null;
    updated_at: string;
};

export type Task = {
    id: string;
    client_id: string;
    step_number: number;
    description: string;
    completed: boolean;
    created_at: string;
};

export type Document = {
    id: string;
    client_id: string;
    name: string;
    storage_path: string;
    file_size: number | null;
    file_type: string | null;
    uploaded_at: string;
};

// Helper: calcula progresso (%)
export function calcProgress(steps: RoadmapStep[]): number {
    if (!steps.length) return 0;
    const completed = steps.filter((s) => s.status === 'completed').length;
    return Math.round((completed / 12) * 100);
}

// Helper: semáforo da empresa
export function getSemaforoStatus(
    steps: RoadmapStep[],
    tasks: Task[]
): 'green' | 'red' | 'yellow' {
    const current = steps.find((s) => s.status === 'current');
    if (!current) return 'yellow';

    const daysSinceUpdate =
        (Date.now() - new Date(current.updated_at).getTime()) / (1000 * 60 * 60 * 24);

    const pendingTasks = tasks.filter(
        (t) => t.step_number === current.step_number && !t.completed
    );

    if (daysSinceUpdate > 18 || pendingTasks.length > 3) return 'red';
    if (pendingTasks.length > 0) return 'yellow';
    return 'green';
}
