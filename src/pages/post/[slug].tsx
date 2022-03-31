import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import * as Prismic from '@prismicio/client';
import * as prismicH from '@prismicio/helpers';
import { getPrismicClient, linkResolver } from '../../services/prismic';

import { Header } from '../../components/Header';
import { Comment } from '../../components/Comment';
import { ExitPreviewButton } from '../../components/ExitPreviewButton';

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

interface PostLink {
  title: string;
  link: string;
}

interface PostProps {
  post: Post;
  minutesToRead: number;
  preview: boolean;
  previousPost: PostLink | null;
  nextPost: PostLink | null;
}

export default function Post({ post, minutesToRead, preview, previousPost, nextPost }: PostProps) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Ignite News | Post</title>
      </Head>

      <Header />

      { router.isFallback
        ? <div>Carregando...</div> 
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

            <div className={styles.footer}>
              <div className={styles.postsLinkContainer}>
                {previousPost && 
                  <div className={styles.postLinkPrev}>
                    <p>{previousPost.title}</p>
                    <a href={previousPost.link}>Post anterior</a>
                  </div>
                }

                {nextPost && 
                  <div className={styles.postLinkNext}>
                    <p>{nextPost.title}</p>
                    <a href={nextPost.link}>Próximo Post</a>
                  </div>
                }
              </div>
              

              <Comment />

              { preview && <ExitPreviewButton />}
            </div>

            
          </div>
        </>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.getByType('post', { 
    orderings: {
      field: 'document.last_publication_date',
      direction: 'desc',
    },
    pageSize: 3,
  });

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

export const getStaticProps: GetStaticProps = async ({ params, previewData }) => {
  const { slug } = params;

  const prismic = getPrismicClient({ previewData });
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

  const preview = previewData === undefined ? false : true;

  const postFirstPublicationDate = response.first_publication_date;

  // fetching previousPost data
  let previousPostResponse;
  let previousPost;

  try {
    previousPostResponse = await prismic?.getFirst({
      predicates: [
        Prismic.predicate.dateAfter('document.first_publication_date', postFirstPublicationDate),  
        Prismic.predicate.at('document.type', 'post'),
      ],
      orderings: { // getting the first post published before current post
        field: 'document.first_publication_date',
        direction: 'asc',
      },
    });

    previousPost = {
      title: previousPostResponse.data.title,
      link: linkResolver(previousPostResponse),
    };
  } catch (err) {
    previousPost = null;
  }
  
  // fetching nextPost data
  let nextPostResponse;
  let nextPost;

  try {
    nextPostResponse = await prismic.getFirst({
      predicates: [
        Prismic.predicate.dateBefore('document.first_publication_date', postFirstPublicationDate),  
        Prismic.predicate.at('document.type', 'post'),
      ],
      orderings: { // getting the first post published before current post
        field: 'document.first_publication_date',
        direction: 'desc',
      },
    });

    nextPost = {
      title: nextPostResponse.data.title,
      link: linkResolver(nextPostResponse),
    };
  } catch {
    nextPost = null;
  }

  return {
    props: { post, minutesToRead, preview, previousPost, nextPost },
    revalidate: 60 * 10, // 10 minutes
  };
};
