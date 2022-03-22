import { GetStaticProps } from 'next';

import { AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';

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

export default function Home() {
  return (
    <>
      <div className={styles.homeBox}>
        <img src="/logo.svg" alt="logo" />

        <a>
            <h1>Title of the Post</h1>
            <p>Subtitle of the Post</p>
            <div className={styles.postInfo}>
              <div id="createdAt">
                <AiOutlineCalendar size="20" color={`var(--gray-500)`}/>
                <time>15 Mar 2021</time>
              </div>
              <div id="author">
                <AiOutlineUser size="20" color={`var(--gray-500)`}/>
                <span>Joseph Oliveira</span>
              </div>
            </div>
        </a>

        <a>
            <h1>Title of the Post</h1>
            <p>Subtitle of the Post</p>
            <div className={styles.postInfo}>
              <div id="createdAt">
                <AiOutlineCalendar size="20" color={`var(--gray-500)`}/>
                <time>15 Mar 2021</time>
              </div>
              <div id="author">
                <AiOutlineUser size="20" color={`var(--gray-500)`}/>
                <span>Joseph Oliveira</span>
              </div>
            </div>
        </a>

        <a>
            <h1>Title of the Post</h1>
            <p>Subtitle of the Post</p>
            <div className={styles.postInfo}>
              <div id="createdAt">
                <AiOutlineCalendar size="20" color={`var(--gray-500)`}/>
                <time>15 Mar 2021</time>
              </div>
              <div id="author">
                <AiOutlineUser size="20" color={`var(--gray-500)`}/>
                <span>Joseph Oliveira</span>
              </div>
            </div>
        </a>

        <a>
            <h1>Title of the Post</h1>
            <p>Subtitle of the Post</p>
            <div className={styles.postInfo}>
              <div id="createdAt">
                <AiOutlineCalendar size="20" color={`var(--gray-500)`}/>
                <time>15 Mar 2021</time>
              </div>
              <div id="author">
                <AiOutlineUser size="20" color={`var(--gray-500)`}/>
                <span>Joseph Oliveira</span>
              </div>
            </div>
        </a>
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
      orderings: '[document.last_publication_date]',
      fetch: ['product.title', 'product.price', 'product.image'],
      pageSize: 5,
    }
  );

  
  console.log(postsResponse);


  return {
    props: { name: 'oi' },
    revalidate: 60 * 10, // 10 minutes
  }
};
