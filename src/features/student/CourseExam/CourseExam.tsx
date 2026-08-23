import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useCourse } from "../../../context/course/useCourse.ts";
import { quizService } from "../../../services/index.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import type { Quiz } from "../../../types/quiz.types.ts";
import styles from "./CourseExam.module.css";

type Phase = "loading" | "ready" | "submitting" | "graded" | "error";

export function CourseExam() {
  const { courseId = "" } = useParams();
  const { user } = useAuth();
  const {
    activeCourse: course,
    progress,
    isLoading,
    error,
    loadCourseById,
    loadTopics,
    loadStudentProgress,
    submitFinalExam,
  } = useCourse();

  const [phase, setPhase] = useState<Phase>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<{ score: number; passed: boolean } | null>(
    null,
  );

  useEffect(() => {
    if (!courseId || !user) return;
    let cancelled = false;
    async function bootstrap() {
      try {
        await loadCourseById(courseId);
        await loadTopics(courseId);
        await loadStudentProgress(user!.id);
        const courseQuizzes = await quizService.listQuizzes({ courseId });
        if (cancelled) return;
        setQuizzes(courseQuizzes);
        setAnswers(Array(questionsOf(courseQuizzes).length).fill(""));
        setPhase("ready");
      } catch {
        if (!cancelled) {
          setLoadError("We could not load this exam. Please try again later.");
          setPhase("error");
        }
      }
    }
    void bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, user?.id]);

  const questions = useMemo(() => questionsOf(quizzes), [quizzes]);
  // A combined exam passes at the strictest of its parts' pass scores.
  const passScore = quizzes.length
    ? Math.min(...quizzes.map((q) => q.passScore))
    : 70;
  const result = progress.find((r) => r.courseId === courseId);

  if (phase === "loading" || (isLoading && !course))
    return <PageSkeleton variant="list" />;
  if (phase === "error")
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <EmptyState title="Exam unavailable" description={loadError ?? error ?? ""} />
        </div>
      </main>
    );
  if (!course)
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <EmptyState
            title="Course unavailable"
            description={error ?? "This course could not be found."}
          />
        </div>
      </main>
    );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    setPhase("submitting");
    const pseudoQuiz: Quiz = {
      id: "final-exam",
      title: "Final exam",
      questions,
      passScore,
    };
    const attempt = quizService.gradeAttempt(pseudoQuiz, answers);
    try {
      await submitFinalExam(
        courseId,
        user.id,
        result?.classroomId ?? "",
        attempt.score,
        passScore,
      );
      setOutcome({ score: attempt.score, passed: attempt.passed });
      setPhase("graded");
    } catch {
      setLoadError("Your exam could not be submitted. Please try again.");
      setPhase("error");
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link to={ROUTES.student.coursePlayer(courseId)} className={styles.back}>
          <ArrowLeft size={16} /> Back to course
        </Link>
        <header className={styles.header}>
          <p>Final exam</p>
          <h1>{course.title}</h1>
          <span>Pass mark: {passScore}%</span>
        </header>

        {phase === "graded" && outcome ? (
          <section
            className={`${styles.result} ${
              outcome.passed ? styles.resultPass : styles.resultFail
            }`}
          >
            {outcome.passed ? (
              <CheckCircle2 size={32} />
            ) : (
              <XCircle size={32} />
            )}
            <h2>{outcome.passed ? "Congratulations — you passed!" : "Not passed this time"}</h2>
            <p>Your final score is {outcome.score}%.</p>
            {!outcome.passed && (
              <Button
                variant="secondary"
                onClick={() => {
                  setAnswers(Array(questions.length).fill(""));
                  setOutcome(null);
                  setPhase("ready");
                }}
              >
                Retake exam
              </Button>
            )}
            {outcome.passed && (
              <Button to={ROUTES.student.results}>View my results</Button>
            )}
          </section>
        ) : questions.length === 0 ? (
          <EmptyState
            title="No exam questions yet"
            description="Your mentor has not published the final exam for this course."
          />
        ) : (
          <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
            {questions.map((question, qIndex) => (
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
                      required
                    />
                    {option}
                  </label>
                ))}
              </fieldset>
            ))}
            <footer className={styles.footer}>
              <Button type="submit" disabled={phase === "submitting"}>
                {phase === "submitting" ? "Submitting…" : "Submit final exam"}
              </Button>
            </footer>
          </form>
        )}
      </div>
    </main>
  );
}

function questionsOf(quizzes: Quiz[]) {
  return quizzes.flatMap((q) => q.questions);
}
