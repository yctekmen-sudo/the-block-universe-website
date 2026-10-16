
"use client";

import { useEffect, useState } from "react";

type Comment = {
  id: number;
  chapter_id: string;
  author_name: string;
  comment_text: string;
  created_at: string;
};

export default function AdminCommentsPage() {
  const [secret, setSecret] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await fetch("/api/admin/comments", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (!cancelled) {
          setComments(data.comments);
          setLoggedIn(true);
        }
      } catch {
        // No active session, or the server is unavailable.
        // Leave the login form visible.
      }
    }

    void checkSession();

    
    async function handleLogout() {
      setError("");

      try {
        const response = await fetch("/api/admin/logout", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Unable to sign out");
        }

        setLoggedIn(false);
        setComments([]);
        setSecret("");
      } catch {
        setError("Unable to sign out. Please try again.");
      }
    }

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ secret }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }

      setLoggedIn(true);
      setCommentsLoading(true);

      try {
        const commentsResponse = await fetch("/api/admin/comments", {
          cache: "no-store",
        });

        if (!commentsResponse.ok) {
          throw new Error("Unable to load comments");
        }

        const data = await commentsResponse.json();
        setComments(data.comments);
      } catch {
        setError("Login succeeded, but comments could not be loaded.");
      } finally {
        setCommentsLoading(false);
      }
      setSecret("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteComment(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this comment?"
    );

    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to delete comment");
      }

      setComments((current) =>
        current.filter((comment) => comment.id !== id)
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete comment"
      );
    }
  }

  return (
    <main className="mx-auto max-w-xl px-5 py-16 font-sans">
      <h1 className="text-3xl font-semibold">
        Comment Administration
      </h1>

      {!loggedIn ? (
        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="admin-secret"
              className="mb-2 block text-sm"
            >
              Administrator secret
            </label>
            <input
              id="admin-secret"
              type="password"
              autoComplete="current-password"
              required
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      ) : (
        <div className="mt-8 space-y-4">
          <p>Administrator login successful.</p>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
        >
          Sign Out
        </button>

        {commentsLoading ? (
          <p>Loading comments...</p>
        ) : comments.length === 0 ? (
          <p>No comments found.</p>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-md border p-4">
                <p className="text-sm font-semibold">
                  {comment.author_name}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Chapter: {comment.chapter_id}
                </p>

                <p className="mt-3 whitespace-pre-wrap break-words text-sm">
                  {comment.comment_text}
                </p>

                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
                
                <button
                  type="button"
                  onClick={() => deleteComment(comment.id)}
                  className="mt-4 rounded-md border px-4 py-2 text-sm text-destructive hover:bg-muted"
                >
                  Delete Comment
                </button>

              </div>
            ))}
          </div>
        )}

        </div>
      )}
    </main>
  );
}
