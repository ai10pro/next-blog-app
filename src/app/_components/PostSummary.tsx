"use client";
import type { Post } from "@/app/_types/Post";

type Props = {
  post: Post;
};

const PostSummary: React.FC<Props> = (props) => {
  const { post } = props;
  return (
    <div className="border border-slate-400 p-3">
      <div className="font-bold">{post.title}</div>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
};

export default PostSummary;