import React, { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.js";
import { TimeMarker } from "../types";
import { FaSearch, FaSearchMinus, FaSearchPlus } from "react-icons/fa";

interface AudioWaveformProps {
  audioFile: File | null;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  currentTime: number;
  markers: TimeMarker[];
  lyrics: string[];
  onMarkerUpdate: (id: string, time: number) => void;
  onMarkerRemove: (id: string) => void;
  onTimeUpdate: (time: number) => void;
  onSeek: (time: number) => void;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  audioFile,
  audioRef,
  currentTime,
  markers,
  lyrics,
  onMarkerUpdate,
  onMarkerRemove,
  onTimeUpdate,
  onSeek,
}) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<RegionsPlugin | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const [viewportWidth, setViewportWidth] = useState<number>(0);
  const [totalWidth, setTotalWidth] = useState<number>(0);
  const [pixelsPerSecond, setPixelsPerSecond] = useState<number>(100);
  const [duration, setDuration] = useState<number>(0);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!waveformRef.current) return;

    // Create WaveSurfer instance with a custom cursor
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#1e40af",
      progressColor: "#3075aa",
      cursorColor: "transparent",
      height: 240,
      normalize: true,
      autoCenter: true,
      minPxPerSec: 200, // or higher for more detail
      fillParent: true, // ensure the waveform fills the container
      dragToSeek: false,
      plugins: [
        TimelinePlugin.create({
          container: "#timeline",
          formatTimeCallback: (seconds) => {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${minutes}:${secs.toFixed(3).padStart(6, "0")}`;
          },
          timeInterval: 0.01,
          primaryLabelInterval: 0.1,
          style: {
            fontSize: "10px",
          },
        }),
      ],
    });

    setPixelsPerSecond(1000);

    // Add regions plugin for markers
    const regions = wavesurfer.registerPlugin(RegionsPlugin.create());
    regionsRef.current = regions;

    // Event handlers
    wavesurfer.on("ready", () => {
      console.log("WaveSurfer is ready");
      setIsReady(true);
      setDuration(wavesurfer.getDuration());

      if (waveformRef.current) {
        setTotalWidth(waveformRef.current.scrollWidth);
        setViewportWidth(waveformRef.current.clientWidth);
      }

      // Disable auto-centering after initial load
      wavesurfer.setOptions({ autoCenter: false });
    });

    wavesurfer.on("error", (err) => {
      console.error("WaveSurfer error:", err);
    });

    wavesurferRef.current = wavesurfer;

    // Cleanup
    return () => {
      wavesurfer.destroy();
    };
  }, []);

  // Add this new useEffect after your WaveSurfer initialization:
  useEffect(() => {
    if (!wavesurferRef.current || !isReady) return;
    // Only update if not dragging (to avoid fighting with user)
    if (!isDragging) {
      wavesurferRef.current.setTime(currentTime);
    }
  }, [currentTime, isReady, isDragging]);

  // Load audio file when it changes
  useEffect(() => {
    if (!wavesurferRef.current || !audioFile) return;

    const fileURL = URL.createObjectURL(audioFile);
    wavesurferRef.current.load(fileURL);

    return () => {
      URL.revokeObjectURL(fileURL);
    };
  }, [audioFile]);

  // Dynamically update WaveSurfer height to fill available space
  useEffect(() => {
    if (!waveformRef.current || !wavesurferRef.current) return;

    const updateHeight = () => {
      const parent = waveformRef.current?.parentElement;
      if (parent && wavesurferRef.current) {
        const timelineHeight = 32; // px, adjust if timeline height changes
        const available = parent.clientHeight - timelineHeight;
        if (available > 40) {
          wavesurferRef.current.setOptions({ height: available });
          // Removed drawBuffer as it doesn't exist on WaveSurfer
        }
      }
    };

    updateHeight();

    const resizeObserver = new window.ResizeObserver(updateHeight);
    if (waveformRef.current.parentElement) {
      resizeObserver.observe(waveformRef.current.parentElement);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, [isReady]);

  // Center the playhead and scroll the waveform
  useEffect(() => {
    if (
      !wavesurferRef.current ||
      !isReady ||
      !containerRef.current ||
      !waveformRef.current
    )
      return;

    // Calculate position
    const currentTimePixel = currentTime * pixelsPerSecond;
    const containerWidth = containerRef.current.clientWidth;
    const centerPosition = currentTimePixel - containerWidth / 2;

    // Scroll to keep playhead centered
    containerRef.current.scrollLeft = Math.max(0, centerPosition);
    setScrollPosition(containerRef.current.scrollLeft);
  }, [currentTime, isReady, pixelsPerSecond]);

  // Update marker regions when markers change
  useEffect(() => {
    if (!wavesurferRef.current || !regionsRef.current || !isReady) return;

    try {
      // Clear existing regions
      regionsRef.current.clearRegions();

      // Add regions for each marker
      markers.forEach((marker) => {
        const lyricText = lyrics[marker.lyricIndex] || "";

        regionsRef.current?.addRegion({
          id: marker.id,
          start: marker.time,
          // Make region visually thinner for precision (0.002s)
          end: marker.time + 0.002,
          color: "rgba(239, 68, 68, 0.7)",
          drag: true,
          resize: false,
          content: lyricText,
        });
      });

      // Custom handling for region labels
      const regionElements = document.querySelectorAll(".wavesurfer-region");
      regionElements.forEach((el: Element) => {
        const id = el.getAttribute("data-id");
        const region = id
          ? regionsRef.current?.getRegions().find((r) => r.id === id)
          : null;
        const marker = id ? markers.find((m) => m.id === id) : null;

        if (region && marker) {
          // Create marker UI
          const markerContainer = document.createElement("div");
          markerContainer.className =
            "absolute top-0 left-0 h-full flex items-center z-10";

          const flagContainer = document.createElement("div");
          flagContainer.className = "h-full relative";

          const triangleFlag = document.createElement("div");
          triangleFlag.className = "absolute left-0 top-0 h-6 w-3 bg-red-600";
          triangleFlag.style.clipPath = "polygon(0% 0%, 100% 50%, 0% 100%)";

          const labelContainer = document.createElement("div");
          labelContainer.className =
            "bg-red-600 text-white text-xs px-2 py-1 rounded-r max-w-[120px] truncate whitespace-nowrap overflow-hidden";
          labelContainer.textContent = lyrics[marker.lyricIndex] || "";

          // Assemble the marker
          flagContainer.appendChild(triangleFlag);
          markerContainer.appendChild(flagContainer);
          markerContainer.appendChild(labelContainer);
          el.appendChild(markerContainer);
        }
      });

      // Handle region updates (when user drags markers)
      regionsRef.current.on("region-updated", (region) => {
        onMarkerUpdate(region.id, region.start);
      });

      // Add contextmenu for removing markers
      regionsRef.current.on("region-clicked", (region, e) => {
        if (e.button === 2) {
          // Right click
          e.preventDefault();
          if (confirm("Remove this marker?")) {
            onMarkerRemove(region.id);
            region.remove();
          }
        }
      });
    } catch (error) {
      console.error("Error updating regions:", error);
    }
  }, [markers, lyrics, onMarkerUpdate, onMarkerRemove, isReady]);

  // Handle horizontal scrolling with mouse drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      // Left mouse button
      setIsDragging(true);
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && containerRef.current && waveformRef.current) {
        const { movementX } = e;
        const container = containerRef.current;

        // Adjust the scroll position (negative movementX to make it feel natural)
        container.scrollLeft -= movementX;
        setScrollPosition(container.scrollLeft);
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle zoom with mouse wheel
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!wavesurferRef.current || !isReady) return;

      e.preventDefault();

      try {
        const currentPxPerSec = pixelsPerSecond;
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        const newPxPerSec = currentPxPerSec * zoomFactor;
        const constrainedValue = Math.max(20, Math.min(500, newPxPerSec));

        wavesurferRef.current.zoom(constrainedValue);
        wavesurferRef.current.setOptions({ minPxPerSec: constrainedValue });
        setPixelsPerSecond(constrainedValue);

        if (waveformRef.current) {
          setTotalWidth(waveformRef.current.scrollWidth);
        }
      } catch (error) {
        console.error("Error applying zoom:", error);
      }
    },
    [isReady, pixelsPerSecond]
  );

  // Zoom button handlers
  const handleZoomIn = useCallback(() => {
    if (!wavesurferRef.current || !isReady) return;

    try {
      const currentPxPerSec = pixelsPerSecond;
      const newValue = Math.min(500, currentPxPerSec * 1.2);

      wavesurferRef.current.zoom(newValue);
      wavesurferRef.current.setOptions({ minPxPerSec: newValue });
      setPixelsPerSecond(newValue);

      if (waveformRef.current) {
        setTotalWidth(waveformRef.current.scrollWidth);
      }
    } catch (error) {
      console.error("Error zooming in:", error);
    }
  }, [isReady, pixelsPerSecond]);

  const handleZoomOut = useCallback(() => {
    if (!wavesurferRef.current || !isReady) return;

    try {
      const currentPxPerSec = pixelsPerSecond;
      const newValue = Math.max(20, currentPxPerSec * 0.8);

      wavesurferRef.current.zoom(newValue);
      wavesurferRef.current.setOptions({ minPxPerSec: newValue });
      setPixelsPerSecond(newValue);

      if (waveformRef.current) {
        setTotalWidth(waveformRef.current.scrollWidth);
      }
    } catch (error) {
      console.error("Error zooming out:", error);
    }
  }, [isReady, pixelsPerSecond]);

  const handleZoomReset = useCallback(() => {
    if (!wavesurferRef.current || !isReady) return;

    try {
      const defaultZoom = 100;

      wavesurferRef.current.zoom(defaultZoom);
      wavesurferRef.current.setOptions({ minPxPerSec: defaultZoom });
      setPixelsPerSecond(defaultZoom);

      if (waveformRef.current) {
        setTotalWidth(waveformRef.current.scrollWidth);
      }
    } catch (error) {
      console.error("Error resetting zoom:", error);
    }
  }, [isReady]);

  return (
    <div className="h-full flex flex-col">
      {!audioFile && (
        <div className="text-center py-12 text-gray-800 relative m-auto self-center">
          <p className="italic text-lg font-semibold">
            No audio loaded. Please upload an audio file to begin.
          </p>
        </div>
      )}

      {audioFile && (
        <div className="flex-grow overflow-hidden relative">
          <div
            ref={containerRef}
            className="h-full relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="relative h-full">
              <div
                ref={waveformRef}
                className="cursor-grab active:cursor-grabbing h-full relative flex items-center"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
            <div id="timeline" className="h-8 border-t w-full" />
          </div>
        </div>
      )}

      <div className="mt-2 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={handleZoomIn}
            className="bg-blue-700 hover:bg-blue-800 text-white p-1 rounded"
            disabled={!isReady}
            title="Zoom In"
          >
            <FaSearchPlus />
          </button>
          <button
            onClick={handleZoomReset}
            className="bg-blue-700 hover:bg-blue-800 text-white p-1 rounded"
            disabled={!isReady}
            title="Reset Zoom"
          >
            <FaSearch />
          </button>
          <button
            onClick={handleZoomOut}
            className="bg-blue-700 hover:bg-blue-800 text-white p-1 rounded"
            disabled={!isReady}
            title="Zoom Out"
          >
            <FaSearchMinus />
          </button>
        </div>

        <div className="text-xs text-gray-600">
          Made by 404oops. If you have any issues, please take your time to
          patch them yourself!
        </div>
      </div>
    </div>
  );
};

export default AudioWaveform;
