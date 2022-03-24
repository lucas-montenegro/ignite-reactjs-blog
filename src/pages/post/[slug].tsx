import { useState, useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import * as prismicH from '@prismicio/helpers';
import { getPrismicClient } from '../../services/prismic';

import { Header } from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const [postStatus, setPostStatus] = useState('loading');

  useEffect(() => {
    setPostStatus('loaded');
  });

  return (
    <>
      <Header />

      <div className={styles.bannerBox}>
        <img src={post?.data.banner.url} alt="banner" />
      </div>

      <div className={styles.postBox}>
        <h1>{post?.data.title}</h1>

        <ul className={styles.postInfo}>
          <li>a</li>
          <li>b</li>
          <li>c</li>
        </ul>

        {postStatus === 'loading' ? (
          <p>Loading…</p>
        ) : (
          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post?.data.content }}
          />
        )}
      </div>

      
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      orderings: '[document.last_publication_date desc]',
      fetch: 'post.uid',
      pageSize: 5,
    }
  );

  // console.log(posts);

  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID<any>('post', slug);

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.reduce((previousItems, currentItem) =>
        previousItems + `<h1>${currentItem.heading}</h1>` + prismicH.asHTML(currentItem.body),
        ''
      ),
    },
  };

  return {
    props: { post },
    revalidate: 60 * 10, // 10 minutes
  };
};
