import { getApiClient } from '~/utils/api-client';

export const useApiClient = () => {
    const config = useRuntimeConfig();
    const apiClient = getApiClient(config.public.apiBaseUrl as string);

    return {
        apiClient,
    };
};
