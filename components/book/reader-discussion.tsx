
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Comment = {
  id: number;
  author_name: string;
  comment_text: string;
  created_at: string;
};

type TurnstileAPI = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    }
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileAPI;
  }
}

export function ReaderDiscussion({ chapterId }: { chapterId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [siteKey, setSiteKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [verificationError, setVerificationError] = useState("");

  const widgetContainer = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  const loadComments = useCallback(async () => {
    setLoading(true);
    setLoadError(false);

    try {
      const response = await fetch(
        `/api/comments?chapter=${encodeURIComponent(chapterId)}`,
        { cache: "no-store" }
      );

      if (!response.ok) throw new Error("Unable to load comments");

      const data = await response.json();
      setComments(data.comments);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const response = await fetch("/api/comments/config");
        if (!response.ok) throw new Error("Configuration unavailable");

        const data = await response.json();
        if (!cancelled) setSiteKey(data.siteKey);
      } catch {
        if (!cancelled) {
          setVerificationError("Comment verification is unavailable.");
        }
      }
    }

    void loadConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!siteKey || !widgetContainer.current) return;

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    function initializeWidget() {
      if (cancelled || widgetId.current) return;

      if (!window.turnstile) {
        retryTimer = setTimeout(initializeWidget, 200);
        return;
      }

      if (!widgetContainer.current) return;

      widgetId.current = window.turnstile.render(
        widgetContainer.current,
        {
          sitekey: siteKey,
          callback: (value) => {
            setToken(value);
            setVerificationError("");
          },
          "expired-callback": () => setToken(""),
          "error-callback": () => {
            setToken("");
            setVerificationError("Verification failed. Please try again.");
          },
        }
      );
    }

    initializeWidget();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);

      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [siteKey]);

  async function submitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !token) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapter: chapterId,
          name,
          comment: message,
          turnstileToken: token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit comment");
      }

      setMessage("");
      setToken("");

      if (widgetId.current && window.turnstile) {
        window.turnstile.reset(widgetId.current);
      }

      await loadComments();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to submit comment"
      );
      setToken("");

      if (widgetId.current && window.turnstile) {
        window.turnstile.reset(widgetId.current);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      aria-labelledby="reader-discussion-heading"
      className="mt-16 border-t pt-10"
    >
      <script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        async
        defer
      />

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

      {loadError && (
        <p className="mt-6 font-sans text-sm" role="alert">
          Comments are temporarily unavailable.
        </p>
      )}

      {!loading && !loadError && comments.length === 0 && (
        <p className="mt-6 font-sans text-sm text-muted-foreground">
          No comments yet. Be the first to join the discussion.
        </p>
      )}

      {!loading && !loadError && comments.length > 0 && (
        <div className="mt-8 space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b pb-6">
              <div className="flex flex-wrap items-center gap-3 font-sans">
                <strong className="text-sm">{comment.author_name}</strong>
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

      <form onSubmit={submitComment} className="mt-10 space-y-5 font-sans">
        <h3 className="text-lg font-semibold">Leave a Comment</h3>

        <div>
          <label htmlFor="comment-name" className="mb-2 block text-sm">
            Your name
          </label>
          <input
            id="comment-name"
            type="text"
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="comment-message" className="mb-2 block text-sm">
            Your comment
          </label>
          <textarea
            id="comment-message"
            required
            maxLength={5000}
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div ref={widgetContainer} />

        {verificationError && (
          <p role="alert" className="text-sm text-destructive">
            {verificationError}
          </p>
        )}

        {submitError && (
          <p role="alert" className="text-sm text-destructive">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !token || !name.trim() || !message.trim()}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Post Comment"}
        </button>
      </form>
    </section>
  );
}
