"use client";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";

const Page: React.FC = () => {
  const router = useRouter();
  const day = new Date().toISOString().split("T")[0];
  const option = "equal";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const selectedDay = formData.get("day") as string;
    const selectedOption = formData.get("option") as string;
    // 2025-01-01 -> 20250101 に変換
    const formattedDay = selectedDay.replace(/-/g, "");
    router.push(`/admin/posts/day/${formattedDay}?option=${selectedOption}`);
  };

  return (
    <main>
      <div className="mb-4 text-2xl font-bold">管理者：日付検索</div>
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
    </main>
  );
};
export default Page;
