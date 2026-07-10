import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { id, type, secretKey } = await request.json();

        if (!id || !type || !secretKey) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const isThread = type === 'threads' || type === 'thread';

        // Verify the secret key matches
        let record;
        if (isThread) {
            record = await prisma.thread.findUnique({ where: { id }, select: { secret_key: true } });
        } else {
            record = await prisma.post.findUnique({ where: { id }, select: { secret_key: true } });
        }

        if (!record) {
            return NextResponse.json({ error: 'Record not found' }, { status: 404 });
        }

        if (record.secret_key !== secretKey) {
            return NextResponse.json({ error: 'Invalid secret key' }, { status: 403 });
        }

        // Delete the record
        if (isThread) {
            await prisma.thread.delete({ where: { id } });
        } else {
            await prisma.post.delete({ where: { id } });
        }

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        console.error('Delete error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
