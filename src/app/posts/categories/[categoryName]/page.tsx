"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { Post } from "@/app/_types/Post";

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

  useEffect(() => {
    // ウェブAPI (/api/posts) からカテゴリに紐づく投稿記事の一覧をフェッチする関数の定義
    const fetchPosts = async () => {
      const decodedName = decodeCategoryName(categoryName);
      console.log("Encoded Category Name:", categoryName);
      console.log("Decoded Category Name:", decodedName);
      // ここに処理を記述
    };
    fetchPosts();
  }, [categoryName]);

  return (
    <main>
      <div className="mb-2 text-2xl font-bold">カテゴリ名一致検索</div>
    </main>
  );
};

export default Page;
