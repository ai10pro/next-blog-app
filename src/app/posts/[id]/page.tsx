"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // ◀ 注目

import type { Post } from "@/app/_types/Post";
import type { PostApiResponse } from "@/app/_types/PostApiResponse";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

import DOMPurify from "isomorphic-dompurify";

// 投稿記事の詳細表示 /posts/[id]
const Page: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 動的ルートパラメータから 記事id を取得 （URL:/posts/[id]）
  const { id } = useParams() as { id: string };
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const requestUrl = `/api/posts/${id}`;
        const response = await fetch(requestUrl, {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }
        const postApiResponse: PostApiResponse = await response.json();
        setPost({
          id: postApiResponse.id,
          title: postApiResponse.title,
          content: postApiResponse.content,
          coverImage: {
            url: postApiResponse.coverImageURL,
            width: 1000,
            height: 1000,
          },
          createdAt: postApiResponse.createdAt,
          categories: postApiResponse.categories.map((category) => ({
            id: category.category.id,
            name: category.category.name,
          })),
        });
      } catch (e) {
        setFetchError(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [id]);

  // 投稿データの取得中は「Loading...」を表示
  if (fetchError) {
    return <div>{fetchError}</div>;
  }

  if (!post) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  // HTMLコンテンツのサニタイズ
  const safeHTML = DOMPurify.sanitize(post.content, {
    ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br"],
  });

  return (
    <main>
      <div className="space-y-2">
        <div className="mb-2 text-2xl font-bold">{post.title}</div>
        {post.coverImage && (
          <div>
            <Image
              src={post.coverImage.url}
              alt="Example Image"
              width={post.coverImage.width}
              height={post.coverImage.height}
              priority
              className="rounded-xl"
            />
          </div>
        )}
        <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
      </div>
    </main>
  );
};

export default Page;
