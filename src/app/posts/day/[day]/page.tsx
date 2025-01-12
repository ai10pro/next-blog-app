// 日時検索ページ
// パスパラメータ day を受け取り、その日時に投稿された記事を一覧表示するページ
// option="equal", "before", "after" で日時検索の方法を指定
// 例: /posts/day/20250101  // 2025年1月1日に投稿された記事を表示(option="equal")
// 例: /posts/day/20250101?option=before
// 例: /posts/day/20250101?option=after

"use client";
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import type { Post } from "@/app/_types/Post";
import type { PostApiResponse } from "@/app/_types/PostApiResponse";
import PostSummary from "@/app/_components/PostSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const Page: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // 動的ルートパラメータから 日時(day) を取得 （URL:/posts/day/[day]）
  const { day } = useParams() as { day: string };
  const option = searchParams.get("option") || "equal";

  // 日時検索の方法を保持する State
  const [searchOption, setSearchOption] = useState(option);

  // 投稿記事配列 (State)。取得中と取得失敗時は null、既存記事が0個なら []
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    // ウェブAPI (/api/day/${day}?option={option}) から投稿記事の一覧をフェッチする関数の定義
    const fetchPosts = async () => {
      setIsLoading(true);
      setSearchOption(option);
      console.log("day", day);
      console.log("option", option);
      console.log("searchOption", searchOption);
      try {
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? `投稿記事の一覧フェッチに失敗しました: ${error.message}`
            : "予期せぬエラーが発生しました";
        setFetchError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (fetchError) {
    return (
      <div>
        <div className="text-lg font-bold"></div>

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
      <div className="mb-2 text-2xl font-bold">日時検索ページ</div>
      <div className="mb-4 text-lg">日時: {day}</div>
      <div className="space-y-3">
        {posts.map((post) => (
          <PostSummary key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
};

export default Page;
