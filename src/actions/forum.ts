'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createThread(formData: FormData) {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const secretKey = formData.get('secretKey') as string;
    const imageUrl = formData.get('imageUrl') as string | null;

    if (!content) {
        return { error: 'Content is required' };
    }

    try {
        const thread = await prisma.thread.create({
            data: {
                title: title?.trim() || 'Untitled Thread',
                content: content.trim(),
                secret_key: secretKey,
                image_url: imageUrl,
            }
        });

        revalidatePath('/forum');
        return { success: true, thread };
    } catch (error) {
        console.error('Error creating thread:', error);
        return { error: 'Failed to create thread' };
    }
}

export async function createReply(formData: FormData) {
    const threadId = formData.get('threadId') as string;
    const content = formData.get('content') as string;
    const secretKey = formData.get('secretKey') as string;
    const imageUrl = formData.get('imageUrl') as string | null;

    if (!threadId || !content) {
        return { error: 'Missing required fields' };
    }

    try {
        const post = await prisma.post.create({
            data: {
                thread_id: threadId,
                content: content.trim(),
                secret_key: secretKey,
                image_url: imageUrl,
            }
        });

        // Bump the thread
        await prisma.thread.update({
            where: { id: threadId },
            data: {
                reply_count: { increment: 1 },
                bumped_at: new Date()
            }
        });

        revalidatePath(`/forum/${threadId}`);
        revalidatePath('/forum');
        
        return { success: true, post };
    } catch (error) {
        console.error('Error creating reply:', error);
        return { error: 'Failed to post reply' };
    }
}
