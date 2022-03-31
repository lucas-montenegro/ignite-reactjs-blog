import { AppProps } from 'next/app';
import Link from 'next/link';

import { PrismicProvider } from '@prismicio/react';
import { PrismicPreview } from '@prismicio/next';

import { linkResolver, repositoryName } from '../services/prismic';

import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <PrismicPreview repositoryName={repositoryName}>
      <Component {...pageProps} />
    </PrismicPreview>
  )
}

export default MyApp;
