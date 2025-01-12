import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

type RouteParams = {
  params: {
    day: string;
  };
};

const encodeDay = (decodedDay: string) => {
  const year = parseInt(decodedDay.substring(0, 4), 10);
  const month = parseInt(decodedDay.substring(4, 6), 10) - 1; // 月は0から始まるので1引く
  const date = parseInt(decodedDay.substring(6, 8), 10);
  const startOfDay = new Date(year, month, date);
  const endOfDay = new Date(year, month, date, 23, 59, 59);
  return { startOfDay, endOfDay };
};

export const GET = async (req: NextRequest, routeParams: RouteParams) => {
  try {
    // パラメータから日時とクエリパラメータを取得
    const { day } = routeParams.params;
    const url = new URL(req.url);
    const option = url.searchParams.get("option") || "equal";

    // 日付を適切な形式に変換
    const { startOfDay, endOfDay } = encodeDay(day);

    // 検索条件を動的に設定
    let dateCondition = {};
    if (option === "before") {
      dateCondition = {
        lt: startOfDay, // 指定された日付より前
      };
    } else if (option === "after") {
      dateCondition = {
        gt: endOfDay, // 指定された日付より後
      };
    } else {
      dateCondition = {
        gte: startOfDay, // 指定された日付と一致、またはそれ以降
        lte: endOfDay, // 指定された日付と一致、またはそれ以前
      };
    }

    const posts = await prisma.post.findMany({
      where: {
        createdAt: dateCondition,
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
          error: `日付=${day}、オプション=${option}の投稿記事が見つかりません`,
          date: { startOfDay, endOfDay },
        },
        { status: 404 }
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
