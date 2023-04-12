import { FC, useEffect, useState } from "react";
import styles from "./answer.module.css";
interface AnswerProps {
  text: string;
}

export const Answer: FC<AnswerProps> = ({ text }) => {
  const [words, setWords] = useState<string[]>([]);
  useEffect(() => {
    setWords(text.split(" "));
  }, [text]);
  return (
    <div>
      {words.map((word, index) => (
        <span
          key={index}
          className={styles.fadeIn}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {word}{" "}
        </span>
      ))}
    </div>
  );
};
