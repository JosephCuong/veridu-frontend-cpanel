import { permanentRedirect } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LegacyArticleRedirectPage({ params }: Props) {
  const resolvedParams = await params;
  permanentRedirect(`/${resolvedParams.slug}`);
}
