import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { searchCache } from '$lib/searchCache';

export async function POST({ request }) {
    try {
        const { key, value } = await request.json();
        
        // Update the in-memory cache for this process
        searchCache[key] = value;
        
        // Write the updated cache to the physical .ts file
        const filePath = path.resolve('src/lib/searchCache.ts');
        const content = `export const searchCache: Record<string, string[]> = ${JSON.stringify(searchCache, null, 2)};\n`;
        
        fs.writeFileSync(filePath, content, 'utf-8');
        
        return json({ success: true });
    } catch (error) {
        console.error('Error writing to cache:', error);
        return json({ error: 'Failed to write cache' }, { status: 500 });
    }
}
