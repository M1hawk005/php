import { NextResponse } from 'next/server';
import { moderateForumItem } from '@/actions/forum';

export async function POST(request: Request) {
  try {
    const { id, type } = await request.json();
    if (!id || (type !== 'thread' && type !== 'post')) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }
    const result = await moderateForumItem(type, id, 'delete');
    if (result.error) {
      const status = result.error.includes('Administrator') ? 403 : 400;
      return NextResponse.json(result, { status });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
