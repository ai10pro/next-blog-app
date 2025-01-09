"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // ◀ 注目
import type { Category } from "@/app/_types/Category";
import type { Post } from "@/app/_types/Post";
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

  const [categories, setCategories] = useState<Category[] | null>(null);
  const [post, setPost] = useState<Post | null>(null);

  // 投稿記事の詳細を取得する関数
  const fetchPost = async () => {
    try {
      // microCMS から記事データを取得
      const requestUrl = `/api/posts/${id}/`;
      const res = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });
      console.log(JSON.stringify(res));
      if (!res.ok) {
        setPost(null);
        throw new Error(`${res.status}: ${res.statusText}`); // -> catch節に移動
      }
      const apiResBody = await res.json();
      setPost(apiResBody as Post);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `記事の取得に失敗しました: ${error.message}`
          : "予期せぬエラーが発生しました";
      console.log(errorMsg);
      setFetchError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  // コンポーネントが読み込まれたときに「1回だけ」実行する処理
  useEffect(() => {
    fetchPost();
  }, []);

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
