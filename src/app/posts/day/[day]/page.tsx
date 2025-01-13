// 日時検索ページ
// パスパラメータ day を受け取り、その日時に投稿された記事を一覧表示するページ
// option="equal", "before", "after" で日時検索の方法を指定
// 例: /posts/day/20250101  // 2025年1月1日に投稿された記事を表示(option="equal")
// 例: /posts/day/20250101?option=before
// 例: /posts/day/20250101?option=after

"use client";
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import type { Post } from "@/app/_types/Post";
import type { PostApiResponse } from "@/app/_types/PostApiResponse";
import PostSummary from "@/app/_components/PostSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { error } from "console";

const Page: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // 動的ルートパラメータから 日時(day) を取得 （URL:/posts/day/[day]）
  const { day } = useParams() as { day: string };
  const option = searchParams.get("option") || "equal";

  // 日時検索の方法を保持する State
  const [searchOption, setSearchOption] = useState(option);

  // 投稿記事配列 (State)。取得中と取得失敗時は null、既存記事が0個なら []
  const [posts, setPosts] = useState<Post[] | null>(null);

  // 日時のデコード処理
  // 例: 20250101 -> 2025年1月1日
  const encodeDay = (decodedDay: string) => {
    const year = parseInt(decodedDay.substring(0, 4), 10);
    const month = parseInt(decodedDay.substring(4, 6), 10) - 1; // 月は0から始まるので1引く
    const date = parseInt(decodedDay.substring(6, 8), 10);
    const day = new Date(year, month, date);
    return day.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    // ウェブAPI (/api/day/${day}?option={option}) から投稿記事の一覧をフェッチする関数の定義
    const fetchPosts = async () => {
      setIsLoading(true);
      setSearchOption(option);
      try {
        const requestUrl = `/api/posts/day/${day}?option=${option}`;
        const response = await fetch(requestUrl, {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) {
          console.log(JSON.stringify(response));
          const errorData = await response.json();
          throw new Error(errorData.error || "データの取得に失敗しました");
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
    fetchPosts();
  }, [day, option]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const selectedDay = formData.get("day") as string;
    const selectedOption = formData.get("option") as string;
    // 2025-01-01 -> 20250101 に変換
    const formattedDay = selectedDay.replace(/-/g, "");
    router.push(`/posts/day/${formattedDay}?option=${selectedOption}`);
  };

  if (fetchError) {
    return (
      <div>
        <div className="text-lg font-bold"></div>

        <div className="text-lg text-red-500">{fetchError}</div>
        <form onSubmit={handleSubmit} className={twMerge("mb-4 space-y-4")}>
          <div className="space-y-1">
            <label htmlFor="day" className="font-bold">
              日時指定
            </label>
            <input
              type="date"
              id="day"
              name="day"
              className="w-full rounded-md border-2 px-2 py-1"
              defaultValue={day}
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
              defaultValue={option}
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
      <form onSubmit={handleSubmit} className={twMerge("mb-4 space-y-4")}>
        <div className="space-y-1">
          <label htmlFor="day" className="font-bold">
            日時指定
          </label>
          <input
            type="date"
            id="day"
            name="day"
            className="w-full rounded-md border-2 px-2 py-1"
            defaultValue={day}
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
            defaultValue={option}
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
      <div className="space-y-2">
        {posts.map((post) => (
          <PostSummary key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
};

export default Page;
