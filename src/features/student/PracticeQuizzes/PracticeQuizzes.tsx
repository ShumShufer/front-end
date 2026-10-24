import { useEffect, useState } from "react";
import { CheckCircle2, ListChecks, XCircle } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { quizService, type QuizAttemptResult } from "../../../services/index.ts";
import type { Quiz } from "../../../types/quiz.types.ts";
import styles from "./PracticeQuizzes.module.css";

type Phase = "list" | "taking" | "result";

export function PracticeQuizzes() {
  const [phase, setPhase] = useState<Phase>("list");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [attempt, setAttempt] = useState<QuizAttemptResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    quizService
      .listQuizzes()
      .then((data) => {
        if (!cancelled) setQuizzes(data);
      })
      .catch(() => {
        if (!cancelled)
          setError("Practice quizzes could not be loaded. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [completedQuizzes, setCompletedQuizzes] = useState<
    Record<string, { score: number; passed: boolean }>
  >(() => {
    try {
      const saved = localStorage.getItem("completed_practice_quizzes");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  function startQuiz(quiz: Quiz) {
    if (completedQuizzes[quiz.id]) return;
    setActiveQuiz(quiz);
    setAnswers(quiz.questions.map(() => ""));
    setAttempt(null);
    setPhase("taking");
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!activeQuiz) return;
    const result = quizService.gradeAttempt(activeQuiz, answers);
    setAttempt(result);
    setCompletedQuizzes((prev) => {
      const next = {
        ...prev,
        [activeQuiz.id]: { score: result.score, passed: result.passed },
      };
      try {
        localStorage.setItem("completed_practice_quizzes", JSON.stringify(next));
      } catch {
        // ignore storage failure
      }
      return next;
    });
    setPhase("result");
  }

  if (isLoading) return <PageSkeleton variant="list" />;

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>
            <ListChecks size={14} /> Practice zone
          </p>
          <h1>Practice quizzes</h1>
          <span>Sharpen your theory knowledge with self-check quizzes.</span>
        </header>

        {error && (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        )}

        {phase === "list" &&
          (quizzes.length ? (
            <section className={styles.grid}>
              {quizzes.map((quiz) => (
                <article key={quiz.id} className={styles.card}>
                  <h2>{quiz.title}</h2>
                  <p>
                    {quiz.questions.length} question
                    {quiz.questions.length === 1 ? "" : "s"} · pass mark{" "}
                    {quiz.passScore}%
                  </p>
                  {completedQuizzes[quiz.id] ? (
                    <Button size="sm" variant="secondary" disabled>
                      Completed ({completedQuizzes[quiz.id].score}%)
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => startQuiz(quiz)}>
                      Start quiz
                    </Button>
                  )}
                </article>
              ))}
            </section>
          ) : (
            <EmptyState
              title="No practice quizzes yet"
              description="Quizzes published by mentors will appear here."
            />
          ))}

        {phase === "taking" && activeQuiz && (
          <form className={styles.quizForm} onSubmit={handleSubmit}>
            {activeQuiz.questions.map((question, qIndex) => (
              <fieldset key={qIndex} className={styles.question}>
                <legend>
                  {qIndex + 1}. {question.question}
                </legend>
                {question.options.map((option) => (
                  <label key={option} className={styles.option}>
                    <input
                      type="radio"
                      name={`q-${qIndex}`}
                      value={option}
                      checked={answers[qIndex] === option}
                      onChange={() =>
                        setAnswers((prev) =>
                          prev.map((a, i) => (i === qIndex ? option : a)),
                        )
                      }
                    />
                    {option}
                  </label>
                ))}
              </fieldset>
            ))}
            <footer className={styles.actions}>
              <Button
                variant="ghost"
                onClick={() => {
                  setPhase("list");
                  setActiveQuiz(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Check answers</Button>
            </footer>
          </form>
        )}

        {phase === "result" && activeQuiz && attempt && (
          <section
            className={`${styles.result} ${
              attempt.passed ? styles.resultPass : styles.resultFail
            }`}
          >
            {attempt.passed ? (
              <CheckCircle2 size={28} />
            ) : (
              <XCircle size={28} />
            )}
            <h2>
              {attempt.score}% ({attempt.earnedPoints}/{attempt.totalPoints}{" "}
              points)
            </h2>
            <p>
              {attempt.passed
                ? `Well done — you cleared the ${activeQuiz.passScore}% pass mark.`
                : `You scored ${attempt.score}%. Minimum required to pass was ${activeQuiz.passScore}%.`}
            </p>
            <p style={{ fontSize: "0.875rem", color: "var(--color-muted)", margin: "0.5rem 0 1rem" }}>
              Quiz submitted. This is a one-time assessment and cannot be retaken or edited.
            </p>
            <footer className={styles.actions}>
              <Button
                variant="primary"
                onClick={() => {
                  setPhase("list");
                  setActiveQuiz(null);
                }}
              >
                Back to quizzes
              </Button>
            </footer>
          </section>
        )}
      </div>
    </main>
  );
}
