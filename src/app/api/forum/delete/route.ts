import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { id, type, secretKey } = await request.json();

        if (!id || !type || !secretKey) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const table = type === 'threads' || type === 'thread' ? 'threads' : 'posts';

        // Verify the secret key matches
        const { data: record, error: fetchError } = await supabaseAdmin
            .from(table)
            .select('secret_key')
            .eq('id', id)
            .single();

        if (fetchError || !record) {
            return NextResponse.json({ error: 'Record not found' }, { status: 404 });
        }

        if (record.secret_key !== secretKey) {
            return NextResponse.json({ error: 'Invalid secret key' }, { status: 403 });
        }

        // Delete the record
        const { error: deleteError } = await supabaseAdmin
            .from(table)
            .delete()
            .eq('id', id);

        if (deleteError) {
            throw deleteError;
        }

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        console.error('Delete error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
