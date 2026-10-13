import { NextResponse } from 'next/server';
import { getCatalog } from '@/lib/catalog';

export async function GET() {
  return NextResponse.json(await getCatalog());
}
