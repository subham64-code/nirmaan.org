"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, authHeader } from "@/lib/api";

type Question = { prompt: string; options: string[] };
type TestPayload = { title: string; durationMinutes: number; totalMarks: number; questions: Question[] };

export default function StudentTestAttemptPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [test, setTest] = useState<TestPayload | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(60 * 60);
  const [startedAt] = useState(() => new Date().toISOString());

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("nirmaan_token") || "";
      const response = await api.get(`/tests/${params.id}`, { headers: authHeader(token) });
      const payload = response.data.data;
      setTest(payload);
      setAnswers(new Array(payload.questions.length).fill(-1));
      setSecondsLeft(payload.durationMinutes * 60);
    };
    load().catch(() => null);
  }, [params.id]);

  const submit = useCallback(async () => {
    const token = localStorage.getItem("nirmaan_token") || "";
    await api.post(`/tests/${params.id}/submit`, { answers, startedAt }, { headers: authHeader(token) });
    router.push("/dashboard/student");
  }, [answers, params.id, router, startedAt]);

  useEffect(() => {
    if (!test) return;
    if (secondsLeft <= 0) {
      submit().catch(() => null);
      return;
    }
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft, submit, test]);

  const timerLabel = useMemo(() => {
    const min = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
    const sec = String(secondsLeft % 60).padStart(2, "0");
    return `${min}:${sec}`;
  }, [secondsLeft]);

  if (!test) return <div className="section">Loading test...</div>;

  return (
    <div className="section space-y-6">
      <div className="glass flex items-center justify-between p-4">
        <h1 className="text-3xl">{test.title}</h1>
        <p className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white">Time Left: {timerLabel}</p>
      </div>

      {test.questions.map((q, i) => (
        <section key={i} className="glass p-5">
          <p className="font-semibold">Q{i + 1}. {q.prompt}</p>
          <div className="mt-3 grid gap-2">
            {q.options.map((option, idx) => (
              <label key={idx} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`q-${i}`}
                  checked={answers[i] === idx}
                  onChange={() => {
                    const next = [...answers];
                    next[i] = idx;
                    setAnswers(next);
                  }}
                />
                {option}
              </label>
            ))}
          </div>
        </section>
      ))}

      <button onClick={() => submit().catch(() => null)} className="rounded-full bg-[var(--brand)] px-6 py-3 font-semibold text-white">Submit Test</button>
    </div>
  );
}
