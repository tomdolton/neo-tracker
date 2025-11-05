import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { DailyAnalysis, AnalysesFilters } from '@/types/neo';

const fetchAnalyses = async (filters?: AnalysesFilters): Promise<DailyAnalysis[]> => {
    // Build query parameters based on filters
    const params: Record<string, string> = {};

    if (filters?.start_date && filters?.end_date) {
        params.start_date = filters.start_date;
        params.end_date = filters.end_date;
    }

    // Make the API request with query parameters if filters are provided
    const { data } = await axios.get<DailyAnalysis[]>('/api/analyses', { params });
    return data;
};

export const useAnalyses = (filters?: AnalysesFilters) => {
    return useQuery({
        queryKey: ['analyses', filters], // Cache entries are segmented by filter (dates) values
        queryFn: () => fetchAnalyses(filters), // Fetch function
        enabled: true, // Always fetch on mount
    });
};
