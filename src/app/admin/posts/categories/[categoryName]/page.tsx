"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { Post } from "@/app/_types/Post";
import type { PostApiResponse } from "@/app/_types/PostApiResponse";
import AdminPostSummary from "@/app/_components/AdminPostSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const Page: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 動的ルートパラメータから カテゴリ名 を取得 （URL:/posts/categories/[categoryName]）
  const { categoryName } = useParams() as { categoryName: string };

  // 投稿記事配列 (State)。取得中と取得失敗時は null、既存記事が0個なら []
  const [posts, setPosts] = useState<Post[] | null>(null);

  // カテゴリ名のデコード処理
  // 例: %E3%81%82%E3%81%84%E3%81%86%E3%81%88 -> あいうえ
  const decodeCategoryName = (encodedCategoryName: string) => {
    return decodeURIComponent(encodedCategoryName);
  };
  const decodedName = decodeCategoryName(categoryName);

  // ウェブAPI (/api/categories/${decodedName}) からカテゴリに紐づく投稿記事の一覧をフェッチする関数の定義
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const requestUrl = `/api/posts/categories/${decodedName}`;
      const response = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });

      if (response.status === 404 || response.status === 201) {
        const errorData = await response.json();
        throw new Error(errorData.error || "エラーが発生しました");
      } else if (!response.ok) {
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
          ? `${error.message}`
          : "予期せぬエラーが発生しました";
      setFetchError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [decodedName]);

  if (fetchError) {
    return (
      <div>
        <div className="text-2xl font-bold">カテゴリ名一致検索</div>
        <div className="text-lg">
          カテゴリ名: {decodeCategoryName(categoryName)}
        </div>

        <div className="text-lg text-red-500">{fetchError}</div>
      </div>
    );
  }

  if (!posts) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <main>
      <div className="mb-2 text-2xl font-bold">カテゴリ名一致検索</div>
      <div className="mb-4 text-lg">
        カテゴリ名: {decodeCategoryName(categoryName)}
      </div>
      <div className="space-y-3">
        {posts.map((post) => (
          <AdminPostSummary
            key={post.id}
            post={post}
            reloadAction={fetchPosts}
            setIsSubmitting={setIsLoading}
          />
        ))}
      </div>
    </main>
  );
};

export default Page;
