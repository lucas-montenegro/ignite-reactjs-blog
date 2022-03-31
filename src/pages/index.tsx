import Head from 'next/head';
import { useState } from 'react';

import { GetStaticProps } from 'next';
import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { PreviewDataProps } from '../types/PreviewData';

import { ExitPreviewButton } from '../components/ExitPreviewButton';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({ postsPagination, preview }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function handleNextPage() {
    const response = await fetch(postsPagination.next_page);
    const data = await response.json();
      
    const next_page = data.next_page;
    const newPosts = data.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.last_publication_date),
          "dd MMM yyyy",
          {
            locale: ptBR,
          }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        }
      }
    })

    setPosts([...posts, ...newPosts]);
    setNextPage(next_page);
  }

  return (
    <>
      <Head>
        <title>Ignite News | Home</title>
      </Head>

      <div className={`${commonStyles.contentContainer}  ${styles.homeContainer}`}>
        <img src="/logo.svg" alt="logo" />

        { posts.map(post => {
          return ( 
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a key={post.uid}>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div className={styles.postInfo}>
                  <div id="createdAt">
                    <FiCalendar size="20" color={`var(--gray-500)`}/>
                    <time>{post.first_publication_date}</time>
                  </div>
                  <div id="author">
                    <FiUser size="20" color={`var(--gray-500)`}/>
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          )
         })
        }

        { (nextPage != null) 
          ? <button onClick={handleNextPage} className={styles.paginationButton}>Carregar mais posts</button>
          : ''
        }

        { preview && <ExitPreviewButton />}
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ previewData }: PreviewDataProps) => {
  const prismic = getPrismicClient({ previewData });

  const postsResponse = await prismic.getByType('post', {
    orderings: {
      field: 'document.first_publication_date',
      direction: 'desc',
    },
    pageSize: 5,
  });

  const { next_page } = postsResponse;
  
  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        "dd MMM yyyy",
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })
  
  const preview = previewData === undefined ? false : true;

  //console.log(JSON.stringify(postsResponse));
  //console.log(posts);


  return {
    props: { 
      postsPagination: {
        next_page,
        results: posts,
      },
      preview,
    },
    revalidate: 60 * 10, // 10 minutes
  }
};
