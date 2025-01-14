"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/app/_types/Category";
import type { Post } from "@/app/_types/Post";
import type { PostApiResponse } from "@/app/_types/PostApiResponse";
import PostSummary from "@/app/_components/PostSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

const Page: React.FC = () => {
  // ローディング状態、エラーメッセージのState
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const router = useRouter();

  // カテゴリ配列 (State)。取得中と取得失敗時は null、既存カテゴリが0個なら []
  const [categories, setCategories] = useState<Category[] | null>(null);

  // 投稿記事配列 (State)。取得中と取得失敗時は null、既存記事が0個なら []
  const [posts, setPosts] = useState<Post[] | null>(null);

  // カテゴリ一覧を取得する関数の定義
  const fetchCategories = async () => {
    try {
      const requestUrl = `/api/categories`;
      const response = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("データの取得に失敗しました");
      }
      const categoryResponse: Category[] = await response.json();
      setCategories(categoryResponse);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `カテゴリ一覧の取得に失敗しました: ${error.message}`
          : "予期せぬエラーが発生しました";
      setFetchError(errorMsg);
    }
  };

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
          : "予期せぬエラーが発生しました";
      setFetchError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  if (fetchError) {
    return <div>{fetchError}</div>;
  }

  if (!posts) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!categories) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  const dateSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const selectedDay = formData.get("day") as string;
    const selectedOption = formData.get("option") as string;
    const formattedDay = selectedDay.replace(/-/g, "");
    router.push(`/posts/day/${formattedDay}?option=${selectedOption}`);
  };

  return (
    <main>
      <div className="mb-2 text-2xl font-bold">Main</div>
      <div className="mb-4 space-y-3">
        {posts.map((post) => (
          <PostSummary key={post.id} post={post} />
        ))}
      </div>

      {/* 検索 */}
      <div className="space-y-3 border-gray-900">
        <div className="text-2xl font-bold">Search</div>
        {/* カテゴリ名検索 */}
        <div className="space-y-1">
          <label htmlFor="category" className="font-bold">
            カテゴリ名一覧
          </label>
          <div className="flex space-x-1.5">
            {categories.map((category) => (
              <button
                key={category.id}
                className={twMerge(
                  "rounded-md px-2 py-0.5",
                  "text-xs font-bold",
                  "border border-slate-400 text-slate-500"
                )}
                onClick={() => {
                  router.push(`/posts/categories/${category.name}`);
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        {/* 日付検索 */}
        <form onSubmit={dateSearch} className={twMerge("mb-4 space-y-4")}>
          <div className="space-y-1">
            <label htmlFor="day" className="font-bold">
              日時指定
            </label>
            <input
              type="date"
              id="day"
              name="day"
              className="w-full rounded-md border-2 px-2 py-1"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="option" className="font-bold">
              オプション
            </label>
            <select
              id="option"
              name="option"
              className="w-full rounded-md border-2 px-2 py-1"
            >
              <option value="equal">指定日時と一致</option>
              <option value="before">指定日時より前</option>
              <option value="after">指定日時より後</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="submit"
              className={twMerge(
                "rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              )}
            >
              検索
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Page;
