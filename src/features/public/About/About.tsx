import { Car, GraduationCap, Handshake, ShieldCheck } from "lucide-react";
import styles from "./About.module.css";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Safety first",
    text: "Every account is verified through Ethiopia's national Fayda ID system.",
  },
  {
    icon: GraduationCap,
    title: "Structured learning",
    text: "Theory, quizzes, practicals and final exams in one clear journey.",
  },
  {
    icon: Handshake,
    title: "Connected schools",
    text: "Interschool agreements let you practice where it's convenient for you.",
  },
  {
    icon: Car,
    title: "Built for Ethiopia",
    text: "Designed with local driving schools, mentors and regulators.",
  },
];

export function About() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>About ShumShufer</p>
          <h1>Driving education, connected</h1>
          <span>
            ShumShufer is the operating platform for driving schools — one place
            for classrooms, courses, scheduling, payments and certification.
          </span>
        </header>

        <section className={styles.valueGrid}>
          {VALUES.map(({ icon: Icon, title, text }) => (
            <article key={title} className={styles.card}>
              <Icon size={20} />
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
