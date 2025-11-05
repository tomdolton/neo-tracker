interface ErrorAlertProps {
    error: Error | null;
}

export function ErrorAlert({ error }: ErrorAlertProps) {
    if (!error) return null;

    /**
     * Extracts error messages with the following fallback order:
     * 1. API response message
     * 2. Specific validation error for end_date
     * 3. General error message
     * 4. Default message
     */
    const friendlyError =
        (error as any)?.response?.data?.message ??
        (error as any)?.response?.data?.errors?.end_date?.[0] ??
        error?.message ??
        'Something went wrong';

    return (
        <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <p className="font-semibold">Error loading data</p>
            <p className="text-sm">{friendlyError}</p>
        </div>
    );
}
