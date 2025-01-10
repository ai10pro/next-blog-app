"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { Category } from "@/app/_types/Category";
import type { Post } from "@/app/_types/Post";
import type { PostApiResponse } from "@/app/_types/PostApiResponse";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import AdminPostSummary from "@/app/_components/AdminPostSummary";

const Page: React.FC = () => {
  // ローディング状態、送信状態、エラーメッセージのState
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 投稿記事配列 (State)。取得中と取得失敗時は null、既存記事が0個なら []
  const [posts, setPosts] = useState<Post[] | null>(null);

  // ウェブAPI (/api/posts) から投稿記事の一覧をフェッチする関数の定義
  const fetchPosts = async () => {
    try {
      const requestUrl = `/api/posts`;
      const response = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("データの取得に失敗しました");
      }
      const postResponse: PostApiResponse[] = await response.json();
      setPosts(
        postResponse.map((rawPost) => ({
          id: rawPost.id,
          title: rawPost.title,
          content: rawPost.content,
          coverImage: {
            url: rawPost.coverImageURL,
            width: 1000,
            height: 1000,
          },
          createdAt: rawPost.createdAt,
          categories: rawPost.categories.map((category) => ({
            id: category.category.id,
            name: category.category.name,
          })),
        }))
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `投稿記事の一覧フェッチに失敗しました: ${error.message}`
          : "予期せぬエラーが発生しました。";
      console.log(errorMsg);
      setFetchError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // コンポーネントがマウントされたとき (初回レンダリングのとき) に1回だけ実行
  useEffect(() => {
    fetchPosts();
  }, []);

  if (fetchError) {
    return <div>{fetchError}</div>;
  }

  return (
    <main>
      <div className="mb-2 text-2xl font-bold">投稿記事管理</div>
      <div className="space-y-3">
        {posts ? (
          posts.map((post) => (
            <AdminPostSummary
              key={post.id}
              post={post}
              reloadAction={fetchPosts}
              setIsSubmitting={setIsLoading}
            />
          ))
        ) : (
          <FontAwesomeIcon icon={faSpinner} spin />
        )}
      </div>
    </main>
  );
};

export default Page;
