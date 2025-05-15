import React, { useRef, useEffect } from "react";
import { FaMicrophone } from "react-icons/fa";

interface PredictiveLyricsDisplayProps {
  lyrics: string[];
  currentIndex: number;
  onDeleteFromIndex?: (index: number) => void; // Add this prop
}

const PredictiveLyricsDisplay: React.FC<PredictiveLyricsDisplayProps> = ({
  lyrics,
  currentIndex,
  onDeleteFromIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Scroll to active line when it changes
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeLine = activeLineRef.current;

      // Calculate the position to scroll to (center the active line)
      const containerHeight = container.clientHeight;
      const lineTop = activeLine.offsetTop;
      const lineHeight = activeLine.clientHeight;

      const scrollPosition = lineTop - containerHeight / 2 + lineHeight / 2;

      container.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [currentIndex]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center mb-2">
        <FaMicrophone className="text-red-700 mr-2" />
        <h2 className="text-lg font-semibold text-gray-100">
          Live Lyrics View
        </h2>
      </div>

      <p className="text-xs text-red-200 mb-2">
        Current line is highlighted. As the audio plays, lyrics will
        automatically scroll.
      </p>

      <div
        ref={containerRef}
        className="flex-grow overflow-y-auto px-3 py-4 bg-red-800 bg-opacity-30 rounded"
      >
        <div className="flex flex-col items-center">
          {lyrics.map((line, index) => {
            const isPast = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isFuture = index > currentIndex;

            let className =
              "py-3 px-4 w-full rounded-lg transition-all duration-200 cursor-pointer ";

            if (isCurrent) {
              className +=
                "bg-red-500 text-white font-semibold shadow-lg scale-105";
            } else if (isPast) {
              className += "text-red-300";
            } else if (isFuture) {
              className += "text-white";
              // Make the immediate next lines more prominent
              if (index === currentIndex + 1) {
                className += " text-white font-medium";
              } else if (index === currentIndex + 2) {
                className += " text-red-100";
              }
            }

            return (
              <div
                key={`lyric-${index}`}
                ref={isCurrent ? activeLineRef : null}
                className={className}
                onClick={() => onDeleteFromIndex && onDeleteFromIndex(index)}
                title="Click to delete this line and all after"
              >
                {line || "(empty line)"}
              </div>
            );
          })}

          {lyrics.length === 0 && (
            <div className="text-red-200 italic text-center py-8">
              No lyrics to display. Enter lyrics in the Raw Lyrics panel.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictiveLyricsDisplay;
