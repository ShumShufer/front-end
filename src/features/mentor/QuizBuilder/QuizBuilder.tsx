import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ListChecks, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "../../../components/Button/Button.tsx";
import { EmptyState } from "../../../components/EmptyState/EmptyState.tsx";
import { PageSkeleton } from "../../../components/Skeleton/PageSkeleton.tsx";
import { useCourse } from "../../../context/course/useCourse.ts";
import { quizService } from "../../../services/index.ts";
import type { Quiz } from "../../../types/quiz.types.ts";
import { ROUTES } from "../../../router/routes.config.ts";
import styles from "./QuizBuilder.module.css";

const MIN_QUESTIONS = 1;
const MAX_OPTIONS = 4;
const MIN_OPTION_INDEX = 0;

interface DraftOption {
  text: string;
}

interface DraftQuestion {
  prompt: string;
  options: DraftOption[];
  correctIndex: number;
  points: number;
}

function emptyQuestion(): DraftQuestion {
  return {
    prompt: "",
    options: [{ text: "" }, { text: "" }],
    correctIndex: MIN_OPTION_INDEX,
    points: 10,
  };
}

export function QuizBuilder() {
  const course = useCourse();
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [passScore, setPassScore] = useState("70");
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion()]);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadCourses() {
      try {
        await course.loadCourses();
        if (!cancelled) {
          setCourses(course.courses.map((c) => ({ id: c.id, title: c.title })));
        }
      } catch {
        if (!cancelled) setFormError("Courses could not be loaded.");
      } finally {
        if (!cancelled) setIsLoadingCourses(false);
      }
    }
    void loadCourses();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCourseId) void course.loadTopics(selectedCourseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId]);

  const totalPoints = useMemo(
    () => questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0),
    [questions],
  );

  function updateQuestion(index: number, patch: Partial<DraftQuestion>) {
    setQuestions((qs) =>
      qs.map((q, i) => (i === index ? { ...q, ...patch } : q)),
    );
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    if (!selectedTopicId) {
      setFormError("Choose the topic this quiz belongs to.");
      return;
    }
    const numericPass = Number(passScore);
    if (
      passScore.trim() === "" ||
      Number.isNaN(numericPass) ||
      numericPass < 1 ||
      numericPass > 100
    ) {
      setFormError("Set a pass score between 1 and 100 percent.");
      return;
    }
    if (
      questions.some(
        (q) =>
          !q.prompt.trim() ||
          q.options.filter((o) => o.text.trim()).length < 2 ||
          !q.options[q.correctIndex]?.text.trim(),
      )
    ) {
      setFormError(
        "Every question needs a prompt, at least two filled options and a valid correct answer.",
      );
      return;
    }
    setIsSaving(true);
    try {
      const payload: Quiz["questions"] = questions.map((q) => {
        const options = q.options.map((o) => o.text.trim()).filter(Boolean);
        return {
          question: q.prompt.trim(),
          options,
          correctAnswer: options[q.correctIndex] ?? "",
          points: Number(q.points) || 0,
        };
      });
      await quizService.createQuiz({
        topicId: selectedTopicId,
        title:
          courses.find((c) => c.id === selectedCourseId)?.title ?? "Practice quiz",
        passScore: numericPass,
        questions: payload,
      });
      setSuccessMessage("Quiz published — students can take it from Practice quizzes.");
      setQuestions([emptyQuestion()]);
    } catch {
      setFormError("The quiz could not be saved. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoadingCourses) return <PageSkeleton variant="list" />;

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link to={ROUTES.mentor.dashboard} className={styles.back}>
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <header className={styles.header}>
          <p>
            <ListChecks size={14} /> Quiz builder
          </p>
          <h1>Create a practice quiz</h1>
        </header>

        {courses.length === 0 ? (
          <EmptyState
            title="No courses available"
            description="Quizzes attach to course topics, so a course is needed first."
          />
        ) : (
          <form className={styles.form} onSubmit={(e) => void handleSave(e)}>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                <span>Course</span>
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    setSelectedTopicId("");
                  }}
                >
                  <option value="">Select a course…</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>Topic</span>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  disabled={!selectedCourseId}
                >
                  <option value="">
                    {course.topics.length ? "Select a topic…" : "No topics"}
                  </option>
                  {course.topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className={`${styles.field} ${styles.passField}`}>
              <span>Pass score (%)</span>
              <input
                type="number"
                min={1}
                max={100}
                value={passScore}
                onChange={(e) => setPassScore(e.target.value)}
              />
            </label>

            <section className={styles.questions}>
              <header className={styles.questionsHeader}>
                <h2>Questions ({questions.length})</h2>
                <button
                  type="button"
                  className={styles.addQuestion}
                  onClick={() => setQuestions((qs) => [...qs, emptyQuestion()])}
                >
                  <PlusCircle size={16} /> Add question
                </button>
              </header>
              {questions.map((question, qIndex) => (
                <article key={qIndex} className={styles.questionCard}>
                  <div className={styles.questionTop}>
                    <strong>Q{qIndex + 1}</strong>
                    {questions.length > MIN_QUESTIONS && (
                      <button
                        type="button"
                        aria-label={`Remove question ${qIndex + 1}`}
                        onClick={() =>
                          setQuestions((qs) => qs.filter((_, i) => i !== qIndex))
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <input
                    className={styles.promptInput}
                    value={question.prompt}
                    placeholder="What does a flashing red traffic light mean?"
                    onChange={(e) =>
                      updateQuestion(qIndex, { prompt: e.target.value })
                    }
                  />
                  <ul className={styles.optionList}>
                    {question.options.map((option, oIndex) => (
                      <li key={oIndex}>
                        <button
                          type="button"
                          aria-label={`Mark option ${oIndex + 1} correct`}
                          className={`${styles.correctToggle} ${
                            question.correctIndex === oIndex ? styles.correctOn : ""
                          }`}
                          onClick={() =>
                            updateQuestion(qIndex, { correctIndex: oIndex })
                          }
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <input
                          value={option.text}
                          placeholder={`Option ${oIndex + 1}`}
                          onChange={(e) =>
                            updateQuestion(qIndex, {
                              options: question.options.map((o, i) =>
                                i === oIndex ? { text: e.target.value } : o,
                              ),
                            })
                          }
                        />
                      </li>
                    ))}
                  </ul>
                  <div className={styles.questionBottom}>
                    {question.options.length < MAX_OPTIONS && (
                      <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() =>
                          updateQuestion(qIndex, {
                            options: [...question.options, { text: "" }],
                          })
                        }
                      >
                        + option
                      </button>
                    )}
                    <label>
                      Points
                      <input
                        type="number"
                        min={1}
                        value={question.points}
                        onChange={(e) =>
                          updateQuestion(qIndex, { points: Number(e.target.value) })
                        }
                      />
                    </label>
                  </div>
                </article>
              ))}
              <p className={styles.total}>Total points: {totalPoints}</p>
            </section>

            {formError && (
              <p className={styles.formError} role="alert">
                {formError}
              </p>
            )}
            {successMessage && (
              <p className={styles.formSuccess} role="status">
                {successMessage}
              </p>
            )}
            <footer className={styles.actions}>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Publishing…" : "Publish quiz"}
              </Button>
            </footer>
          </form>
        )}
      </div>
    </main>
  );
}
