import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

type RouteParams = {
  params: {
    categoryName: string;
  };
};

const decodeCategoryName = (encodedCategoryName: string) => {
  return decodeURIComponent(encodedCategoryName);
};

export const GET = async (req: NextRequest, routeParams: RouteParams) => {
  try {
    // パラメータからデコードされたカテゴリ名を取得
    const categoryName = decodeCategoryName(routeParams.params.categoryName);
    console.log("instance", routeParams.params.categoryName);

    // カテゴリ名がカテゴリ一覧にあるか確認
    const category = await prisma.category.findFirst({
      where: {
        name: categoryName,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: `categoryName:${categoryName} が存在しません` },
        { status: 404 }
      );
    }

    // カテゴリ名に一致する投稿記事を取得
    const posts = await prisma.post.findMany({
      where: {
        categories: {
          some: {
            category: {
              name: categoryName,
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        coverImageURL: true,
        createdAt: true,
        updatedAt: true,
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (posts.length === 0) {
      return NextResponse.json(
        {
          error: `categoryName:${categoryName} が含まれた投稿記事はありません`,
        },
        { status: 201 }
      );
    }
    return NextResponse.json(posts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿記事の取得に失敗しました" },
      { status: 500 }
    );
  }
};
