import { sanityClient } from 'sanity:client';
import { createImageUrlBuilder } from '@sanity/image-url';

const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: unknown) {
  return builder.image(source);
}

export interface NewsImage {
  _type: 'image';
  asset: {
    _id: string;
    _type: 'sanity.imageAsset';
  };
  alt?: string;
  caption?: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string;
  excerpt?: string;
  mainImage?: NewsImage | null;
}

export interface PostDetail extends Post {
  body: unknown[];
}

export const POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  mainImage {
    asset->,
    alt
  }
}`;

export const POST_SLUGS_QUERY = `*[_type == "post" && defined(slug.current)] {
  "slug": slug.current
}`;

export const POST_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  mainImage {
    asset->,
    alt
  },
  body[] {
    ...,
    _type == "image" => {
      asset->,
      alt,
      caption
    }
  }
}`;

export function fetchPosts(): Promise<Post[]> {
  return sanityClient.fetch(POSTS_QUERY);
}

export function fetchPost(slug: string): Promise<PostDetail | null> {
  return sanityClient.fetch(POST_QUERY, { slug });
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
