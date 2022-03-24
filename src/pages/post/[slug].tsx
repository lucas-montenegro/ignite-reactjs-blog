import { GetStaticPaths, GetStaticProps } from 'next';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client';
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
  minutesToRead: number;
}

export default function Post({ post, minutesToRead }: PostProps) {
  return (
    <>
      <Header />

      {post?.data === undefined
        ? <p>Carregando...</p> 
        : (
        <>
          <div className={styles.bannerBox}>
            <img src={post.data.banner.url} alt="banner" />
          </div>

          <div className={`${commonStyles.contentContainer}  ${styles.postContainer}`}>
            <h1>{post.data.title}</h1>

            <ul className={styles.postInfo}>
              <li id="date">
                <FiCalendar size="20" color={`var(--gray-500)`}/>
                <time>{post.first_publication_date}</time>
              </li>
              <li id="author">
                <FiUser size="20" color={`var(--gray-500)`}/>
                <span>{post.data.author}</span>
              </li>
              <li id="timeToRead">
                <FiClock size="20" color={`var(--gray-500)`}/>
                <span>{minutesToRead} min</span>
              </li>
            </ul>

            <div
              className={styles.postContent}
              dangerouslySetInnerHTML={{ __html: post.data.content }}
            />
          </div>
        </>
      )}
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
      pageSize: 3,
    }
  );

  const postsPaths = posts.results.map(post => {
    return {
      params: { slug: post.uid},
    }
  })

  return {
    paths: postsPaths,
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

  const wordRegex = /[!@#$%^&*(),%:;"'¨<>/[\]{}=?+\d\s . -]+/g;

  const wordsInPost = response.data.content.reduce((previousItems, currentItem) =>
    previousItems + currentItem.heading.split(' ').length + prismicH.asText(currentItem.body).split(wordRegex).length,
    0
  ); // this returns an empty string ("") counting as a word at the end of each paragraph

  const emptyWordsCount = response.data.content.length; // taking out the empty string ("") of each paragraph

  const minutesToRead = Math.ceil((wordsInPost - emptyWordsCount) / 200);

  return {
    props: { post, minutesToRead },
    revalidate: 60 * 10, // 10 minutes
  };
};
