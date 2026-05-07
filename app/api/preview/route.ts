import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const slug = url.searchParams.get('slug') || '/';

  if (!token || token !== process.env.CONTENTSTACK_PREVIEW_TOKEN) {
    return new NextResponse('Invalid preview token', { status: 401 });
  }

  const response = NextResponse.redirect(slug);
  response.cookies.set('__prerender_bypass', '1', { path: '/' });
  response.cookies.set('__next_preview_data', 'preview', { path: '/' });

  return response;
}
