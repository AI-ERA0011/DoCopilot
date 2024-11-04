"use client";

import { FormEvent, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

type UploadResponse = {
  document_id: string;
};

type ChatResponse = {
  answer: string;
  sources: string[];
};

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [documentId, setDocumentId] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [chatResult, setChatResult] = useState<ChatResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const askDisabled = useMemo(() => !documentId || !question.trim(), [documentId, question]);

  const handleUpload = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (!pdfFile) {
      setUploadStatus("Please choose a PDF first.");
      return;
    }

    const body = new FormData();
    body.append("pdf_file", pdfFile);
    setIsUploading(true);
    setUploadStatus("Uploading...");

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Upload failed");
      }

      const data = (await response.json()) as UploadResponse;
      setDocumentId(data.document_id);
      setUploadStatus("Upload complete. You can now ask a question.");
    } catch (error) {
      console.error(error);
      setUploadStatus("Upload failed. Check the backend server logs.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleChat = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (askDisabled) {
      return;
    }

    setIsAsking(true);
    setChatResult(null);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, document_id: documentId || null }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Chat failed");
      }

      const data = (await response.json()) as ChatResponse;
      setChatResult(data);
    } catch (error) {
      console.error(error);
      setChatResult({ answer: "Something went wrong. Check the backend server.", sources: [] });
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-12 px-6 py-16 text-slate-100">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.4em] text-indigo-400">DoCopilot</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Upload a PDF and chat with it using the FastAPI backend.
          </h1>
          <p className="text-base text-slate-300">
            Backend URL: <span className="font-mono text-indigo-300">{API_BASE}</span>
          </p>
        </header>

        <section className="grid gap-10 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg sm:grid-cols-2">
          <form onSubmit={handleUpload} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold uppercase tracking-wide text-slate-200">
                PDF Upload
              </label>
              <p className="text-sm text-slate-400">
                Select a document (up to the size limit enforced by the API) and send it to the FastAPI /upload route.
              </p>
            </div>

            <input
              type="file"
              accept="application/pdf"
              onChange={(evt) => {
                setPdfFile(evt.target.files?.[0] ?? null);
                setUploadStatus("");
                setChatResult(null);
              }}
              className="rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 file:mr-3 file:rounded-md file:border-none file:bg-indigo-500 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-white"
            />

            <button
              type="submit"
              disabled={isUploading}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? "Uploading..." : "Upload PDF"}
            </button>

            {uploadStatus && <p className="text-sm text-slate-300">{uploadStatus}</p>}
            {documentId && (
              <p className="text-xs font-mono text-emerald-300">document_id: {documentId}</p>
            )}
          </form>

          <form onSubmit={handleChat} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold uppercase tracking-wide text-slate-200">
                Ask a Question
              </label>
              <p className="text-sm text-slate-400">
                The question is sent to the FastAPI /chat route along with the uploaded document ID.
              </p>
            </div>

            <textarea
              value={question}
              onChange={(evt) => setQuestion(evt.target.value)}
              rows={6}
              placeholder="What does the document say about..."
              className="rounded-2xl border border-white/15 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400"
            />

            <button
              type="submit"
              disabled={askDisabled || isAsking}
              className="rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAsking ? "Thinking..." : "Ask"}
            </button>
          </form>
        </section>

        {chatResult && (
          <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">Answer</h2>
            <article className="prose prose-invert max-w-none text-slate-100">
              {chatResult.answer.split("\n").map((line) => (
                <p key={line}>{line}</p>
              ))}
            </article>
            {Boolean(chatResult.sources?.length) && (
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Sources
                </p>
                <ul className="list-disc space-y-1 pl-6 text-sm text-indigo-200">
                  {chatResult.sources.map((src, index) => (
                    <li key={`${src}-${index}`}>{src || "N/A"}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
// update 2024-08-20 8:29:20
// update 2024-08-20 16:19:50
// update 2024-08-23 8:31:28
// update 2024-08-30 14:12:32
// update 2024-08-30 13:35:44
// update 2024-09-11 13:54:47
// update 2024-09-18 8:34:40
// update 2024-09-18 12:50:2
// update 2024-10-04 13:41:32
// update 2024-10-09 10:42:36
// update 2024-10-11 8:54:24
// update 2024-10-11 12:40:30
// update 2024-08-27 16:13:6
// update 2024-09-20 16:32:21
// update 2024-10-05 17:45:42
// update 2024-10-11 14:24:15
// update 2024-09-24 11:32:34
// update 2024-09-04 13:32:29
// update 2024-09-12 16:46:49
// update 2024-11-19 8:55:16
// update 2025-02-14 14:8:18
// update 2024-09-27 15:45:36
// update 2024-10-07 13:15:50
// update 2024-11-04 16:21:12
// update 2024-11-04 13:37:19
