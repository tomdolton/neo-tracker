export interface DailyAnalysis {
    id: number;
    analysis_date: string;
    total_neo_count: number;
    average_diameter_min: number;
    average_diameter_max: number;
    max_velocity: number;
    smallest_miss_distance: number;
    created_at: string;
    updated_at: string;
}

export interface AnalysesFilters {
    start_date?: string;
    end_date?: string;
}
