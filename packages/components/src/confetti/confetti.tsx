import { cx } from "@utility/cx";
import { useForceRender } from "@wingmnn/utils/hooks";
import React, { useCallback, useEffect, useRef } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  shape: "square" | "circle" | "triangle" | "rectangle";
}

const colors = [
  "#FF6B6B",
  "#FF8E8E",
  "#FFB1B1", // Red shades
  "#4ECDC4",
  "#7DD3D8",
  "#A8E6CF", // Teal shades
  "#45B7D1",
  "#6BC5E8",
  "#91D3F0", // Blue shades
  "#FFA07A",
  "#FFB399",
  "#FFC6B8", // Orange shades
  "#98D8C8",
  "#B5E2D3",
  "#D2ECDE", // Green shades
  "#F7DC6F",
  "#F9E79F",
  "#FCF3CF", // Yellow shades
];

const shapes: Array<ConfettiPiece["shape"]> = [
  "square",
  "circle",
  "triangle",
  "rectangle",
];

const getShapeElement = (piece: ConfettiPiece, opacity: number) => {
  const baseStyle = {
    position: "absolute" as const,
    left: `${piece.x - piece.size / 2}px`,
    top: `${piece.y - piece.size / 2}px`,
    width: `${piece.size}px`,
    height: `${piece.size}px`,
    opacity,
    transform: `rotate(${piece.rotation}deg)`,
    pointerEvents: "none" as const,
    zIndex: 10,
  };

  switch (piece.shape) {
    case "rectangle":
      return (
        <div
          key={piece.id}
          style={{
            ...baseStyle,
            backgroundColor: piece.color,
            height: 5,
            width: 10,
          }}
        />
      );
    case "circle":
      return (
        <div
          key={piece.id}
          style={{
            ...baseStyle,
            backgroundColor: piece.color,
            borderRadius: "50%",
          }}
        />
      );
    case "triangle":
      return (
        <div
          key={piece.id}
          style={{
            ...baseStyle,
            width: 0,
            height: 0,
            backgroundColor: "transparent",
            borderLeft: `${piece.size / 2}px solid transparent`,
            borderRight: `${piece.size / 2}px solid transparent`,
            borderBottom: `${piece.size}px solid ${piece.color}`,
          }}
        />
      );
    default: // square
      return (
        <div
          key={piece.id}
          style={{
            ...baseStyle,
            backgroundColor: piece.color,
          }}
        />
      );
  }
};

// Move this outside the component to avoid closure issues
let idCounter = 0;
const createConfettiPiece = (containerWidth: number): ConfettiPiece => {
  const color = colors[Math.floor(Math.random() * colors.length)];

  return {
    id: idCounter++,
    x: Math.random() * containerWidth,
    y: -20,
    vx: (Math.random() - 0.5) * 2,
    vy: Math.random() * 2 + 1,
    rotation: Math.random() * 360,
    rotationSpeed: Math.random() * 8,
    color,
    size: Math.random() * 4 + 6,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
  };
};

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  className?: string;
}

export const Confetti: React.FC<Props> = (props) => {
  const { className, ...rest } = props;
  const renderer = useForceRender();
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(-1);
  const lastSpawnTime = useRef<number>(0);

  // Store current state in refs to avoid stale closures
  const confettiRef = useRef<ConfettiPiece[]>([]);
  const confetti = confettiRef.current;

  const setConfetti = React.useCallback(
    (setter: (prevValue: TSAny) => TSAny) => {
      confettiRef.current = setter(confettiRef.current);
    },
    [],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const container = containerRef.current;
      if (container) {
        const burstConfetti: ConfettiPiece[] = [];
        for (let i = 0; i < 10; i++) {
          const piece = createConfettiPiece(container.offsetWidth);
          piece.x = mouseX + (Math.random() - 0.5) * 50;
          piece.y = mouseY + (Math.random() - 0.5) * 50;
          piece.vx = (Math.random() - 0.5) * 6;
          piece.vy = (Math.random() - 0.5) * 6;
          burstConfetti.push(piece);
        }
        setConfetti((prev) => [...prev, ...burstConfetti]);
      }
    },
    [setConfetti],
  );

  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const container = containerRef.current;
      if (!container) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      // Use functional updates to ensure we get the latest state
      let newConfetti = [...confettiRef.current];

      // Spawn new confetti pieces
      if (now - lastSpawnTime.current > 150) {
        // Reduced from 200ms to 150ms
        for (let i = 0; i < 5; i++) {
          // Increased from 2 to 3 pieces
          newConfetti.push(createConfettiPiece(containerWidth));
        }
        lastSpawnTime.current = now;
      }

      // Update confetti positions and apply forces
      newConfetti = newConfetti.map((piece) => {
        const newPiece: ConfettiPiece = { ...piece };

        // Update position
        newPiece.x += newPiece.vx;
        newPiece.y += newPiece.vy;
        newPiece.rotation += newPiece.rotationSpeed;

        // Apply gravity and air resistance
        newPiece.vy += 0.1;
        newPiece.vx *= 0.98;
        newPiece.vy *= 0.98;

        // Bounce off walls
        if (newPiece.x < 0 || newPiece.x > containerWidth) {
          newPiece.vx *= -0.7;
          newPiece.x = Math.max(0, Math.min(containerWidth, newPiece.x));
        }

        return newPiece;
      });

      // Remove confetti that's fallen off screen
      confettiRef.current = newConfetti.filter(
        (piece) => piece.y < containerHeight,
      );

      renderer();

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start the animation
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== -1) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [renderer]); // Empty dependency array is correct here

  return (
    <div
      {...rest}
      className={cx(
        "w-full h-full overflow-hidden absolute top-0 left-0",
        className,
      )}
    >
      <div
        ref={containerRef}
        onClick={handleClick}
        className="w-full h-full relative cursor-pointer"
      >
        {confetti.map((piece) => {
          const container = containerRef.current;
          if (!container) return null;

          const progress = Math.max(0, piece.y / container.offsetHeight);
          const opacity = Math.max(0.1, 1 - progress * 0.7);

          return getShapeElement(piece, opacity);
        })}
      </div>
    </div>
  );
};
