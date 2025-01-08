"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { Category } from "@/app/_types/Category";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

// カテゴリをフェッチしたときのレスポンスのデータ型
type CategoryApiResponse = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

// 投稿記事のカテゴリ選択用データ
type SelectableCategory = {
  id: string;
  name: string;
  isSelect: boolean;
};

const Page: React.FC = () => {
  // ローディング状態、送信状態、エラーメッセージのState
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);

  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostTitleError, setNewPostTitleError] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostContentError, setNewPostContentError] = useState("");
  const [newPostCoverImageUrl, setNewPostCoverImageUrl] = useState("");

  const router = useRouter();
  // カテゴリ配列 (State)。取得中と取得失敗時は null、既存カテゴリが0個なら []
  const [checkableCategories, setCheckableCategories] = useState<
    SelectableCategory[] | null
  >(null);
  // ウェブAPI (/api/categories) からカテゴリの一覧をフェッチする関数の定義
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      // フェッチ処理の本体
      const requestUrl = "/api/categories";
      const res = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });
      // console.log("res", res);
      // レスポンスのステータスコードが200以外の場合 (カテゴリのフェッチに失敗した場合)
      if (!res.ok) {
        setCheckableCategories([]);
        throw new Error(`${res.status}: ${res.statusText}`); // -> catch節に移動
      }
      // レスポンスのボディをJSONとして読み取りカテゴリ配列 (State) にセット
      const apiResBody = (await res.json()) as CategoryApiResponse[];
      setCheckableCategories(
        apiResBody.map((body) => ({
          id: body.id,
          name: body.name,
          isSelect: false,
        }))
      );

      // console.log("apiResBody", apiResBody);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `カテゴリの一覧のフェッチに失敗しました: ${error.message}`
          : `予期せぬエラーが発生しました ${error}`;
      console.error(errorMsg);
      setFetchErrorMsg(errorMsg);
    } finally {
      // 成功した場合も失敗した場合もローディング状態を解除
      setIsLoading(false);
    }
  };

  // コンポーネントがマウントされたとき (初回レンダリングのとき) に1回だけ実行
  useEffect(() => {
    fetchCategories();
  }, []);

  // タイトルのバリデーション
  const updateNewPostTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setNewPostTitle(newTitle);
    setNewPostTitleError(
      newTitle.length < 2 || newTitle.length > 64
        ? "2文字以上64文字以内で入力してください。"
        : ""
    );
  };

  // 内容のバリデーション
  const updateNewPostContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setNewPostContent(newContent);
    setNewPostContentError(
      newContent.length < 2 ? "2文字以上入力してください。" : ""
    );
  };

  // カバーイメージのバリデーション
  const updateNewPostCoverImageUrl = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewPostCoverImageUrl(e.target.value);
  };

  // カテゴリの選択状態を切り替える関数
  const switchCategoryState = (categoryId: string) => {
    if (!checkableCategories) return;

    setCheckableCategories(
      checkableCategories.map((category) =>
        category.id === categoryId
          ? { ...category, isSelect: !category.isSelect }
          : category
      )
    );
  };

  // フォームの送信処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // ▼▼ 追加 ウェブAPI (/api/admin/posts) にPOSTリクエストを送信する処理
    try {
      const requestBody = {
        title: newPostTitle,
        content: newPostContent,
        coverImageURL: newPostCoverImageUrl,
        categoryIds: checkableCategories
          ? checkableCategories.filter((c) => c.isSelect).map((c) => c.id)
          : [],
      };
      const requestUrl = "/api/admin/posts/";
      console.log(`${requestUrl} => ${JSON.stringify(requestBody, null, 2)}`);
      const res = await fetch(requestUrl, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`); // -> catch節に移動
      }

      const postResponse = await res.json();
      setIsSubmitting(false);
      router.push(`/posts/${postResponse.id}`); // 投稿記事の詳細ページに移動
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `新しい記事の作成に失敗しました: ${error.message}`
          : `予期せぬエラーが発生しました ${error}`;
      alert(errorMsg);
      console.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main>
        <div className="flex h-96 items-center justify-center">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl" />
          Loading...
        </div>
      </main>
    );
  }

  if (fetchErrorMsg) {
    return <main className="text-red-500">{fetchErrorMsg}</main>;
  }

  return (
    <main>
      <div className="mb-4 text-2xl font-bold">投稿記事の新規作成</div>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex items-center rounded-lg bg-white px-8 py-4 shadow-lg">
            <FontAwesomeIcon
              icon={faSpinner}
              className="mr-2 animate-spin text-gray-500"
            />
            <div className="flex items-center text-gray-500">処理中...</div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={twMerge("mb-4 space-y-4", isSubmitting && "opacity-50")}
      >
        <div className="space-y-1">
          <label htmlFor="title" className="block font-bold">
            タイトル
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="w-full rounded-md border-2 px-2 py-1"
            placeholder="新しい記事のタイトルを記入してください"
            value={newPostTitle}
            onChange={updateNewPostTitle}
            autoComplete="off"
            required
          />
          {newPostTitleError && (
            <div className="flex items-center space-x-1 text-sm font-bold text-red-500">
              <FontAwesomeIcon icon={faTriangleExclamation} />
              <span>{newPostTitleError}</span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="content" className="block font-bold">
            内容
          </label>
          <textarea
            id="content"
            name="content"
            className="w-full rounded-md border-2 px-2 py-1"
            placeholder="新しい記事の内容を記入してください"
            value={newPostContent}
            onChange={updateNewPostContent}
            autoComplete="off"
            required
          />
          {newPostContentError && (
            <div className="flex items-center space-x-1 text-sm font-bold text-red-500">
              <FontAwesomeIcon icon={faTriangleExclamation} />
              <span>{newPostContentError}</span>
            </div>
          )}
        </div>
        {/* カバーイメージ（URL） */}
        <div className="space-y-1">
          <label htmlFor="coverImageUrl" className="block font-bold">
            カバーイメージ（URL）
          </label>
          <input
            type="text"
            id="coverImageUrl"
            name="coverImageUrl"
            className="w-full rounded-md border-2 px-2 py-1"
            placeholder="新しい記事のカバーイメージの URL を記入してください"
            value={newPostCoverImageUrl}
            onChange={updateNewPostCoverImageUrl}
            autoComplete="off"
            // required　// カバーイメージは任意のため required は不要
          />
        </div>
        {/* カテゴリのチェックボックスを追加 */}
        <div className="space-y-1">
          <div className="font-bold">タグ</div>
          <div className="flex flex-wrap gap-x-3.5">
            {checkableCategories && checkableCategories.length > 0 ? (
              checkableCategories.map((c) => (
                <label key={c.id} className="flex space-x-1">
                  <input
                    id={c.id}
                    type="checkbox"
                    checked={c.isSelect}
                    className="mt-0.5 cursor-pointer"
                    onChange={() => switchCategoryState(c.id)}
                  />
                  <span className="cursor-pointer">{c.name}</span>
                </label>
              ))
            ) : (
              <div>選択可能なカテゴリが存在しません。</div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className={twMerge(
              "rounded-md px-5 py-1 font-bold",
              "bg-indigo-500 text-white hover:bg-indigo-600",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            disabled={
              isSubmitting ||
              newPostTitleError !== "" ||
              newPostContentError !== "" ||
              newPostTitle === "" ||
              newPostContent === ""
            }
          >
            投稿記事を作成
          </button>
        </div>
      </form>
    </main>
  );
};

export default Page;
