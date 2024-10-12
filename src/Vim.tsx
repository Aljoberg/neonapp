import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// const TYPING_SPEED_ADDITION = 20;

type Mode = "normal" | "insert" | "visual";

type Command = string | number;

const colorMap: Record<string, string | null> = {
  "--red": "text-red-500",
  "--green": "text-green-500",
  "--blue": "text-blue-500",
  "--yellow": "text-yellow-500",
  "--purple": "text-purple-500",
  "--pink": "text-pink-500",
  "--cyan": "text-cyan-500",
  "--jade": "text-jade",
  "--white": null,
  "--aljo": "text-aljo",
  "--neonvim": "text-neonvim",
};

export function Vim({ commands }: { commands: Command[] }) {
  const [text, setText] = useState<{ char: string; color: string | null }[][]>([
    [],
  ]);
  const [cursorPosition, setCursorPosition] = useState<{
    line: number;
    column: number;
  }>({ line: 0, column: 0 });
  const [mode, setMode] = useState<Mode>("normal");
  const [visualStart, setVisualStart] = useState<{
    line: number;
    column: number;
  } | null>(null);
  const [commandIndex, setCommandIndex] = useState(0);
  const [keyPresses, setKeyPresses] = useState<string[]>([]);
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const [size, setSize] = useState(5); // text-4xl
  /*const [images, setImages] = useState<{ url: string; description: string }[]>(
    []
  );
  const [showImages, setShowImages] = useState<boolean[]>([]);
  const [terminalMoved, setTerminalMoved] = useState<boolean>(false);
*/
  let textClassName = "text-base"; // lol i didnt even need this
  if (size === 2) textClassName = "text-xl";
  else if (size === 3) textClassName = "text-2xl";
  else if (size === 4) textClassName = "text-3xl";
  else if (size === 5) textClassName = "text-4xl";
  let lineHeight = 1.5; // text-base
  if (size === 2) lineHeight = 1.75;
  else if (size === 3) lineHeight = 2;
  else if (size === 4) lineHeight = 2.25;
  else if (size === 5) lineHeight = 2.5;

  const handleKeyPress = useCallback(
    (command: Command, isVisualMovement: boolean = false) => {
      if (typeof command === "number") {
        return command * 1000; // i dont think this is used but ill keep it
      }

      /*if (typeof command === "object" && command !== null) {
        if (command.cmd === "images") {
          const { images } = command;
          setTimeout(() => setImages(images), 550);
          setShowImages(new Array(images.length).fill(false));
          setTerminalMoved(true);
          return;
        }
        return;
      }*/

      setKeyPresses((prev) => [...prev, command as string]);

      if (mode === "normal" || isVisualMovement) {
        switch (command) {
          case "i":
            setMode("insert");
            break;
          case "a":
            setMode("insert");
            setCursorPosition((prev) => {
              if (prev.column < text[prev.line].length) {
                return { ...prev, column: prev.column + 1 };
              } else if (prev.line < text.length - 1) {
                return { line: prev.line + 1, column: 0 };
              } else {
                return prev;
              }
            });
            break;
          case "v":
            setMode("visual");
            setVisualStart(cursorPosition);
            break;
          case "h":
            setCursorPosition((prev) => {
              if (prev.column > 0) {
                return { ...prev, column: prev.column - 1 };
              } else if (prev.line > 0) {
                return {
                  line: prev.line - 1,
                  column: text[prev.line - 1].length,
                };
              } else {
                return prev;
              }
            });
            break;
          case "l":
            setCursorPosition((prev) => {
              if (prev.column < text[prev.line].length) {
                return { ...prev, column: prev.column + 1 };
              } else if (prev.line < text.length - 1) {
                return { line: prev.line + 1, column: 0 };
              } else {
                return prev;
              }
            });
            break;
          case "j":
            setCursorPosition((prev) => {
              if (prev.line < text.length - 1) {
                const newLine = prev.line + 1;
                const newColumn = Math.min(prev.column, text[newLine].length);
                return { line: newLine, column: newColumn };
              } else {
                return prev;
              }
            });
            break;
          case "k":
            setCursorPosition((prev) => {
              if (prev.line > 0) {
                const newLine = prev.line - 1;
                const newColumn = Math.min(prev.column, text[newLine].length);
                return { line: newLine, column: newColumn };
              } else {
                return prev;
              }
            });
            break;
          case "dd":
            setText((prev) => {
              const newText = [...prev];
              newText.splice(cursorPosition.line, 1);
              if (newText.length === 0) {
                newText.push([]);
              }
              return newText;
            });
            setCursorPosition((prev) => {
              const newLine = Math.min(prev.line, text.length - 1);
              const newColumn = 0;
              return { line: newLine, column: newColumn };
            });
            break;
          default:
            if (command.startsWith("--fontSize"))
              setSize(parseInt(command.split("-").at(-1)!));
            else if (command in colorMap) {
              setCurrentColor(colorMap[command]);
            }
        }
      } else if (mode === "insert") {
        if (command === "Esc") {
          setMode("normal");
          if (cursorPosition.column > 0) {
            setCursorPosition((prev) => ({
              ...prev,
              column: prev.column - 1,
            }));
          } else if (cursorPosition.line > 0) {
            setCursorPosition((prev) => ({
              line: prev.line - 1,
              column: text[prev.line - 1].length,
            }));
          }
        } else {
          if (command === "\n") {
            setText((prev) => {
              const newText = [...prev];
              const currentLine = newText[cursorPosition.line];
              const beforeCursor = currentLine.slice(0, cursorPosition.column);
              const afterCursor = currentLine.slice(cursorPosition.column);
              newText[cursorPosition.line] = beforeCursor;
              newText.splice(cursorPosition.line + 1, 0, afterCursor);
              return newText;
            });
            setCursorPosition((prev) => ({
              line: prev.line + 1,
              column: 0,
            }));
          } else {
            setText((prev) => {
              const newText = [...prev];
              const currentLine = newText[cursorPosition.line];
              const newLine = [
                ...currentLine.slice(0, cursorPosition.column),
                { char: command, color: currentColor },
                ...currentLine.slice(cursorPosition.column),
              ];
              newText[cursorPosition.line] = newLine;
              return newText;
            });
            setCursorPosition((prev) => ({
              ...prev,
              column: prev.column + 1,
            }));
          }
        }
      } else if (mode === "visual") {
        if (command === "Esc") {
          setMode("normal");
          setVisualStart(null);
        } else if (
          command === "h" ||
          command === "l" ||
          command === "j" ||
          command === "k"
        ) {
          handleKeyPress(command, true);
        } else if (command === "d") {
          if (visualStart !== null) {
            setText((prev) => {
              const newText = [...prev];
              const startLine = Math.min(visualStart.line, cursorPosition.line);
              const endLine = Math.max(visualStart.line, cursorPosition.line);
              let startColumn =
                visualStart.line === startLine
                  ? visualStart.column
                  : cursorPosition.column;
              let endColumn = cursorPosition.column;

              if (startColumn > endColumn) {
                [startColumn, endColumn] = [endColumn, startColumn];
              }

              if (startLine === endLine) {
                const line = newText[startLine];
                const newLine = [
                  ...line.slice(0, startColumn),
                  ...line.slice(endColumn + 1),
                ];
                newText[startLine] = newLine;
              } else {
                const firstLine = newText[startLine].slice(0, startColumn);
                const lastLine = newText[endLine].slice(endColumn + 1);
                newText.splice(startLine, endLine - startLine + 1, [
                  ...firstLine,
                  ...lastLine,
                ]);
              }
              return newText;
            });
            setCursorPosition({
              line: Math.min(visualStart.line, cursorPosition.line),
              column: Math.min(visualStart.column, cursorPosition.column),
            });
            setVisualStart(null);
            setMode("normal");
          }
        }
      }
    },
    [mode, cursorPosition, text, currentColor, visualStart]
  );

  useEffect(() => {
    if (commandIndex < commands.length) {
      const command = commands[commandIndex];
      const delay =
        typeof command === "number" ? command * 1000 : Math.random() * 100; //+ TYPING_SPEED_ADDITION;

      const timer = setTimeout(() => {
        if (typeof command === "string" || typeof command === "object") {
          handleKeyPress(command);
        }
        setCommandIndex((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [commands, commandIndex, handleKeyPress]);

  // useEffect(() => {
  //   if (images.length > 0) {
  //     setTimeout(() => {
  //       images.forEach((_, index) => {
  //         setTimeout(() => {
  //           setShowImages((prev) => {
  //             const newShowImages = [...prev];
  //             newShowImages[index] = true;
  //             return newShowImages;
  //           });
  //         }, index * 500);
  //       });
  //     }, 500);
  //   }
  // }, [images]);

  const Cursor = ({
    mode,
    position,
  }: {
    mode: Mode;
    position: { line: number; column: number };
  }) => {
    const getStyle = () => {
      const baseStyle = "absolute pointer-events-none";
      switch (mode) {
        case "normal":
          return cn(baseStyle, "w-[1ch] bg-primary/50");
        case "insert":
          return cn(baseStyle, "w-0.5 bg-primary animate-pulse");
        case "visual":
          return cn(baseStyle, "w-[1ch] bg-primary/20");
      }
    };

    return (
      <span
        className={getStyle()}
        style={{
          left: `${position.column}ch`,
          top: `${position.line * lineHeight}rem`,
          height: `${lineHeight}rem`,
        }}
      />
    );
  };

  const getText = () => {
    return text.map((line, lineIndex) => (
      <div key={lineIndex}>
        {line.map((charObj, charIndex) => {
          const isSelected = (() => {
            if (mode !== "visual" || visualStart === null) {
              return false;
            }
            const startLine = Math.min(visualStart.line, cursorPosition.line);
            const endLine = Math.max(visualStart.line, cursorPosition.line);
            const startColumn =
              visualStart.line === startLine
                ? visualStart.column
                : cursorPosition.column;
            const endColumn =
              visualStart.line === endLine
                ? visualStart.column
                : cursorPosition.column;

            if (lineIndex > startLine && lineIndex < endLine) {
              return true;
            }
            if (lineIndex === startLine && lineIndex === endLine) {
              return (
                charIndex >=
                  Math.min(visualStart.column, cursorPosition.column) &&
                charIndex <= Math.max(visualStart.column, cursorPosition.column)
              );
            }
            if (lineIndex === startLine) {
              return charIndex >= startColumn;
            }
            if (lineIndex === endLine) {
              return charIndex <= endColumn;
            }
            return false;
          })();

          return (
            <span
              key={charIndex}
              className={cn(
                isSelected ? "bg-primary/20" : "",
                charObj.color || undefined
              )}
            >
              {charObj.char}
            </span>
          );
        })}
      </div>
    ));
  };

  return (
    <div className="flex flex-col items-center min-h-dvh bg-background font-mono">
      <div
        className={cn(
          "flex items-center flex-col justify-center flex-1",
          textClassName
          // terminalMoved ? "mt-4" : "mt-0"
        )}
      >
        <div className="flex items-center justify-center">
          <pre className="relative whitespace-pre-wrap break-words text-foreground">
            {getText()}
            <Cursor mode={mode} position={cursorPosition} />
          </pre>
        </div>
      </div>
      <div className="flex justify-evenly border rounded-md w-5/6 sm:w-2/3 items-center my-4 fixed left-1/2 bottom-0 -translate-x-1/2">
        <Badge variant="outline" className="p-2 m-2">
          {mode.toUpperCase()}
        </Badge>
        <Badge variant="outline" className="p-2 m-2">
          {keyPresses.slice(-10).join(" ")}
        </Badge>
      </div>
    </div>
  );
}
