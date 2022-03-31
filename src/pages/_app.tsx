import { AppProps } from 'next/app';
import { PrismicPreview } from '@prismicio/next';
import { repositoryName } from '../services/prismic';

import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <PrismicPreview repositoryName={repositoryName}>
      <Component {...pageProps} />
    </PrismicPreview>
  );
}

export default MyApp;
