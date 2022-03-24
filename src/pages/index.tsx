import { useState } from 'react';

import { GetStaticProps } from 'next';
import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client';
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
}

export default function Home({ postsPagination }: HomeProps) {
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
      </div>

      
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
     Prismic.Predicates.at('document.type', 'post'),
    ],
    {
      orderings: '[document.last_publication_date desc]', 
      pageSize: 5,
    },
  );

  const next_page = postsResponse.next_page;
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
  
  //console.log(JSON.stringify(postsResponse));
  //console.log(posts);


  return {
    props: { 
      postsPagination: {
        next_page: next_page,
        results: posts,
      }
    },
    revalidate: 60 * 10, // 10 minutes
  }
};
