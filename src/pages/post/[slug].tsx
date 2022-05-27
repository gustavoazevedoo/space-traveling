/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import React, { ReactNode } from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  uid: string;
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

export default function Post({ post }: PostProps): ReactNode {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <main>
      <figure className={styles.banner}>
        <img src={post.data.banner.url} alt="Post banner" />
      </figure>
      <article className={styles.post}>
        <h1>{post.data.title}</h1>
        <div className={styles.infos}>
          <time>
            <FiCalendar size={20} />
            {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </time>
          <span>
            <FiUser size={20} />
            {post.data.author}
          </span>
          <span>
            <FiClock size={20} />4 min
          </span>
        </div>
        {post.data.content.map(content => (
          <React.Fragment key={content.heading}>
            <h2>{content.heading}</h2>
            <div
              className={styles.postContent}
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(content.body),
              }}
            />
          </React.Fragment>
        ))}
      </article>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});

  const postsResponse = await prismic.getByType('post');

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
    };
  });

  return {
    paths: posts.map(post => {
      return {
        params: {
          slug: post.uid,
        },
      };
    }),
    fallback: true,
  };

  // TODO
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});

  const response = await prismic.getByUID('post', String(slug));

  const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(obj => {
        return {
          heading: obj.heading,
          body: obj.body,
        };
      }),
      subtitle: response.data.subtitle,
    },
  };

  // TODO
  return {
    props: {
      post,
    },
    revalidate: 30 * 60, // 30 minutes
  };
};
