import { PrismicDocument } from '@prismicio/types';
import * as prismic from '@prismicio/client';
import { enableAutoPreviews } from '@prismicio/next';

export const repositoryName = 'ignite-blog-lucasmaa';

export function linkResolver(doc: PrismicDocument): string {
  console.log(doc);
  if (doc.type === 'posts') {
    return `/post/${doc.uid}`;
  }

  return '/';
}

// This factory function allows smooth preview setup
export function getPrismicClient(config = {}) {
  const client = prismic.createClient(process.env.PRISMIC_API_ENDPOINT);

  enableAutoPreviews({
    client,
    previewData: config.previewData,
    req: config.req,
  });

  return client;
}