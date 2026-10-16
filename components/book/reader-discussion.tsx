
"use client";

import { useEffect, useState } from "react";

type Comment = {
  id: number;
  author_name: string;
  comment_text: string;
  created_at: string;
};

export function ReaderDiscussion({ chapterId }: { chapterId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadComments() {
      setLoading(true);
      setError(false);
      setComments([]);

      try {
        const response = await fetch(
          `/api/comments?chapter=${encodeURIComponent(chapterId)}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Unable to load comments");
        }

        const data = await response.json();

        if (!cancelled) {
          setComments(data.comments);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadComments();

    return () => {
      cancelled = true;
    };
  }, [chapterId]);

  return (
    <section
      aria-labelledby="reader-discussion-heading"
      className="mt-16 border-t pt-10"
    >
      <h2
        id="reader-discussion-heading"
        className="font-sans text-2xl font-semibold"
      >
        Reader Discussion
      </h2>

      <p className="mt-3 font-sans text-sm text-muted-foreground">
        Questions, comments, and constructive criticism are welcome.
      </p>

      {loading && (
        <p className="mt-6 font-sans text-sm">Loading comments...</p>
      )}

      {error && (
        <p className="mt-6 font-sans text-sm" role="alert">
          Comments are temporarily unavailable.
        </p>
      )}

      {!loading && !error && comments.length === 0 && (
        <p className="mt-6 font-sans text-sm text-muted-foreground">
          No comments yet. Be the first to join the discussion.
        </p>
      )}

      {!loading && !error && comments.length > 0 && (
        <div className="mt-8 space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b pb-6">
              <div className="flex flex-wrap items-center gap-3 font-sans">
                <strong className="text-sm">
                  {comment.author_name}
                </strong>
                <time
                  dateTime={comment.created_at}
                  className="text-xs text-muted-foreground"
                >
                  {new Date(comment.created_at).toLocaleDateString()}
                </time>
              </div>

              <p className="mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed">
                {comment.comment_text}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
