"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { Category } from "@/app/_types/Category";
import { Post } from "@/app/_types/Post";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

// カテゴリをフェッチしたときのレスポンスのデータ型
type CategoryApiResponse = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

// 投稿記事をフェッチしたときのレスポンスのデータ型
type PostApiResponse = {
  id: string;
  title: string;
  content: string;
  coverImageUrl: string;
  createdAt: string;
  updatedAt: string;
  categories: CategoryApiResponse[];
};

const Page: React.FC = () => {
	// ローディング状態、送信状態、エラーメッセージのState
	const [isLoading, setIsLoading] = useState(false);
	const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);

  // カテゴリ配列 (State)。取得中と取得失敗時は null、既存カテゴリが0個なら []
  const [categories, setCategories] = useState<Category[] | null>(null);

	// 投稿記事配列 (State)。取得中と取得失敗時は null、既存記事が0個なら []
	const [posts, setPosts] = useState<Post[] | null>(null);


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
			// レスポンスのステータスコードが200以外の場合 (カテゴリのフェッチに失敗した場合)
			if (!res.ok) {
				setCategories([]);
				throw new Error(`${res.status}: ${res.statusText}`); // -> catch節に移動
			}
			// レスポンスのボディをJSONとして読み取りカテゴリ配列 (State) にセット
			const apiResBody = (await res.json()) as CategoryApiResponse[];
			setCategories(
				apiResBody.map((category) => ({
					id: category.id,
					name: category.name,
				}))
			);
		} catch (error) {
			const errorMsg =
				error instanceof Error
					? `カテゴリの一覧フェッチに失敗しました: ${error.message}`
					: "予期せぬエラーが発生しました。";
			console.log(errorMsg);
			setFetchErrorMsg(errorMsg);
		} finally {
			setIsLoading(false);
		}
	};

	// ウェブAPI (/api/posts) から投稿記事の一覧をフェッチする関数の定義
	const fetchPosts = async () => {
		try {
			setIsLoading(true);
			// フェッチ処理の本体
			const requestUrl = "/api/posts";
			const res = await fetch(requestUrl, {
				method: "GET",
				cache: "no-store",
			});
			// レスポンスのステータスコードが200以外の場合 (投稿記事のフェッチに失敗した場合)
			if (!res.ok) {
				setPosts([]);
				throw new Error(`${res.status}: ${res.statusText}`); // -> catch節に移動
			}
			// レスポンスのボディをJSONとして読み取り投稿記事配列 (State) にセット
			const apiResBody = (await res.json()) as PostApiResponse[];
			setPosts(
				apiResBody.map((post) => ({
					id: post.id,
					title: post.title,
					content: post.content,
					createdAt: post.createdAt,
					coverImageUrl: post.coverImageUrl,
					categories: post.categories.map((category) => ({
						id: category.id,
						name: category.name,
					})),
				}))
			);
		} catch (error) {
			const errorMsg =
				error instanceof Error
					? `投稿記事の一覧フェッチに失敗しました: ${error.message}`
					: "予期せぬエラーが発生しました。";
			console.log(errorMsg);
			setFetchErrorMsg(errorMsg);
		} finally {
			setIsLoading(false);
		}
	};
		};
	
		
	return (
		<main>
			{/* 出力（html） */}
		</main>
	)

};

export default Page;
