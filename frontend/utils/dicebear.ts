/**
 * DiceBear Avatar Utilities
 * Generate avatar URLs from seeds using DiceBear API
 * https://www.dicebear.com/
 */

export const DICEBEAR_API_VERSION = '7.x';
export const DICEBEAR_BASE_URL = `https://api.dicebear.com/${DICEBEAR_API_VERSION}`;

/**
 * Available avatar styles from DiceBear
 */
export const AVATAR_STYLES = [
    { value: 'adventurer', label: 'Adventurer', description: 'Phong cách phiêu lưu' },
    { value: 'adventurer-neutral', label: 'Adventurer Neutral', description: 'Phiêu lưu trung tính' },
    { value: 'avataaars', label: 'Avataaars', description: 'Phong cách Sketch' },
    { value: 'avataaars-neutral', label: 'Avataaars Neutral', description: 'Sketch trung tính' },
    { value: 'bottts', label: 'Bottts', description: 'Robot dễ thương' },
    { value: 'bottts-neutral', label: 'Bottts Neutral', description: 'Robot trung tính' },
    { value: 'fun-emoji', label: 'Fun Emoji', description: 'Emoji vui nhộn' },
    { value: 'lorelei', label: 'Lorelei', description: 'Phong cách hiện đại' },
    { value: 'lorelei-neutral', label: 'Lorelei Neutral', description: 'Hiện đại trung tính' },
    { value: 'micah', label: 'Micah', description: 'Phong cách đơn giản' },
    { value: 'personas', label: 'Personas', description: 'Nhân vật cá tính' },
] as const;

export type AvatarStyle = typeof AVATAR_STYLES[number]['value'];

/**
 * Generate avatar URL from seed and style
 */
export function generateAvatarUrl(
    seed: string,
    style: AvatarStyle = 'adventurer',
    options?: {
        backgroundColor?: string;
        size?: number;
    }
): string {
    if (!seed) {
        seed = getRandomSeed();
    }

    const params = new URLSearchParams({
        seed: seed,
    });

    if (options?.backgroundColor) {
        params.append('backgroundColor', options.backgroundColor);
    }

    if (options?.size) {
        params.append('size', options.size.toString());
    }

    return `${DICEBEAR_BASE_URL}/${style}/svg?${params.toString()}`;
}

/**
 * Generate random seed for avatar
 */
export function getRandomSeed(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

/**
 * Generate multiple random seeds
 */
export function generateRandomSeeds(count: number = 12): string[] {
    const seeds: string[] = [];
    for (let i = 0; i < count; i++) {
        seeds.push(getRandomSeed());
    }
    return seeds;
}

/**
 * Get avatar URL with fallback priority:
 * 1. avatarSeed (DiceBear)
 * 2. avatarUrl (custom URL)
 * 3. userName as seed (DiceBear fallback)
 */
export function getAvatarUrl(params: {
    avatarSeed?: string | null;
    avatarUrl?: string | null;
    userName?: string;
    style?: AvatarStyle;
}): string {
    const { avatarSeed, avatarUrl, userName, style = 'adventurer' } = params;

    // Priority 1: Use avatarSeed for DiceBear
    if (avatarSeed) {
        return generateAvatarUrl(avatarSeed, style);
    }

    // Priority 2: Use custom avatar URL
    if (avatarUrl) {
        return avatarUrl;
    }

    // Priority 3: Fallback to userName as seed
    return generateAvatarUrl(userName || 'default', style);
}

/**
 * Extract seed from DiceBear URL
 */
export function extractSeedFromUrl(url: string): string | null {
    try {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('seed');
    } catch {
        return null;
    }
}

/**
 * Check if URL is a DiceBear URL
 */
export function isDiceBearUrl(url: string): boolean {
    return url.includes('api.dicebear.com');
}
