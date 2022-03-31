import { PrismicDocument } from '@prismicio/types';
import * as prismic from '@prismicio/client';
import { enableAutoPreviews } from '@prismicio/next';
import sm from '../../sm.json';

export const repositoryName = new URL(sm.apiEndpoint).hostname.split('')[0];

export function linkResolver(doc: PrismicDocument): string {
  if (doc.type === 'post') {
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