"use client";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

const Page: React.FC = () => {
  return (
    <main>
      <div className="mb-5 text-center text-5xl font-bold">About Me</div>
      <div
        className={twMerge(
          "mx-auto mb-5 w-full md:w-2/3",
          "flex justify-center"
        )}
      >
        <Image
          src="/images/avatar.jpg"
          alt="Example Image"
          width={350}
          height={350}
          priority
          className="rounded-full border-4 border-slate-500 p-1.5 sm:size-1/2 md:size-auto"
        />

      </div>
      <div className="space-y-3 text-xl">
        <div className="md:flex md:justify-center">
          <div className="text-xl font-bold md:w-1/6 md:text-center">名 前</div>
          <div className="text-xl md:w-5/6">ai10pro(とりさん)</div>
        </div>
        <div className="md:flex md:justify-center">
          <div className="font-bold md:w-1/6 md:text-center">
            ポートフォリオ
          </div>
          <div className="md:w-5/6">
            <a
              href="https://ai10pro.github.io/my-portfolio/"
              className="mr-1 text-blue-500 underline"
            >
              とりさんのポートフォリオ
            </a>
            (GitHub Pages)
          </div>
        </div>
        <div className="md:flex md:justify-center">
          <div className="font-bold md:w-1/6 md:text-center">自己紹介</div>
          <div className="md:w-5/6">
            とある高専の情報系学科3年生です。このブログアプリを作っているときはかなり眠い時なのでよくわからにゃいコードがあります。
            ゲームが大好きですが、作るのは得意ではないので、ご容赦ください。
          </div>
        </div>
      </div>

    </main>
  );
};

export default Page;
