import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { DailyAnalysis, AnalysesFilters } from '@/types/neo';

const fetchAnalyses = async (filters?: AnalysesFilters): Promise<DailyAnalysis[]> => {
    const params: Record<string, string> = {};

    if (filters?.start_date && filters?.end_date) {
        params.start_date = filters.start_date;
        params.end_date = filters.end_date;
    }

    const { data } = await axios.get<DailyAnalysis[]>('/api/analyses', { params });
    return data;
};

export const useAnalyses = (filters?: AnalysesFilters) => {
    return useQuery({
        queryKey: ['analyses', filters],
        queryFn: () => fetchAnalyses(filters),
        enabled: true, // Always fetch on mount
    });
};
