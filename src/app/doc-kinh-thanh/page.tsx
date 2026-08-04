import { redirect } from 'next/navigation';
import { fetchBibleMetadata } from '@/lib/api';

export default async function DocKinhThanhIndexPage() {
  const metadata = await fetchBibleMetadata();
  const firstBook = metadata.books && metadata.books.length > 0 ? metadata.books[0].slug : 'sang-the';
  const firstTrans = metadata.translations && metadata.translations.length > 0 ? metadata.translations[0].slug : 'ntt';
  redirect(`/doc-kinh-thanh/${firstBook}/1?t=${firstTrans}`);
}
