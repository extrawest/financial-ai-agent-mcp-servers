import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const ConfigsSchema = z.object({
    openaiApiKey: z.string().optional(),
    newsApiKey: z.string().optional(),
});

export type Configs = z.infer<typeof ConfigsSchema>;

export const configs: Configs = {
    openaiApiKey: process.env.OPENAI_API_KEY,
    newsApiKey: process.env.NEWS_API_KEY,
};

// Validate
try {
    ConfigsSchema.parse(configs);
} catch (error) {
    console.warn('Settings validation warning:', error);
}
