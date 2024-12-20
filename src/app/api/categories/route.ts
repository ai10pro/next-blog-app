import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { Category } from "@prisma/client";

// [GET] /api/categories カテゴリ一覧の取得
export const GET = async (req: NextRequest) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,

        // カテゴリに紐づく投稿を取得する場合
        // posts: {
        //   select: {
        //     post: {
        //       select: {
        //         id: true,
        //         title: true,
        //         content: true,
        //         createdAt: true,
        //       },
        //     },
        //   },
        // },

        // カテゴリに紐づく投稿数を取得する場合
        // _count: {
        //   select: {
        //     posts: true,
        //   },
        // },
      },
      orderBy: {
        createdAt: "desc", // 降順 (新しい順)
      },
    });
    // console.log(categories);
    return NextResponse.json(categories, { status: 200 }); // 200: OK
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "カテゴリの取得に失敗しました" },
      { status: 500 } // 500: Internal Server Error
    );
  }
};
