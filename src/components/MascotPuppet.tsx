import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  playEntranceSound,
  playExitSound,
  playMessageSound,
  playTapSound,
  playBubbleClickSound,
} from '../lib/mascotAudio';

const IMAGES = {
  frontHair: 'https://huanmux.github.io/assets/image/serafina/front-hair.png',
  eyes: 'https://huanmux.github.io/assets/image/serafina/eyes-irises.png',
  face: 'https://huanmux.github.io/assets/image/serafina/face.png',
  torsoNeck: 'https://huanmux.github.io/assets/image/serafina/torso-neck.png',
  backHair: 'https://huanmux.github.io/assets/image/serafina/back-hair.png',
};

const OFFLINE_MODAL_PROMPT = 'Tap or click on that Offline icon on the top-right corner to know how';
const OFFLINE_SLM_PROMPT = 'Or switch to a local mini SLM that runs right in your browser!';

interface MascotPuppetProps {
  isOnline?: boolean;
  onOpenServerModal?: () => void;
  isBrowserModel?: boolean;
  onScrollToSLM?: () => void;
}

export function MascotPuppet({
  isOnline = true,
  onOpenServerModal,
  isBrowserModel = false,
  onScrollToSLM,
}: MascotPuppetProps) {
  const [dismissed, setDismissed] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [bounceKey, setBounceKey] = useState(0);
  const puppetRef = useRef<HTMLDivElement>(null);

  // Track if server was ever detected as offline in this session
  const serverWasOfflineRef = useRef(!isOnline && !isBrowserModel);

  // Mouse eye-tracking physics
  useEffect(() => {
    if (dismissed) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!puppetRef.current) return;
      const rect = puppetRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width * 0.5;
      const eyeCenterY = rect.top + rect.height * 0.38;

      const dx = e.clientX - eyeCenterX;
      const dy = e.clientY - eyeCenterY;
      const dist = Math.hypot(dx, dy);
      if (dist === 0) return;

      const angle = Math.atan2(dy, dx);
      const MAX_OFFSET = 2.4;
      const intensity = Math.min(dist / 320, 1) * MAX_OFFSET;

      setEyeOffset({
        x: Math.cos(angle) * intensity,
        y: Math.sin(angle) * intensity,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [dismissed]);

  // Play entrance sound on mount
  useEffect(() => {
    playEntranceSound();
  }, []);

  // Play message sound when thought bubble text changes
  const isInitialMsgRef = useRef(true);
  useEffect(() => {
    if (isInitialMsgRef.current) {
      isInitialMsgRef.current = false;
      return;
    }
    if (currentMessage && !dismissed) {
      playMessageSound();
    }
  }, [currentMessage, dismissed]);

  // Dialogue sequencing based on server status and SLM suggestion (no greeting in puppet)
  useEffect(() => {
    let t1: any;
    let t2: any;
    let t3: any;
    let t4: any;
    let tExit: any;
    const effectiveOnline = isBrowserModel ? true : isOnline;

    if (!effectiveOnline) {
      serverWasOfflineRef.current = true;

      // 1. Initial detection of offline status
      setCurrentMessage('Uh oh, looks like the default server is offline right now.');

      // 2. Suggest turning on own server
      t1 = setTimeout(() => {
        setCurrentMessage('You can turn on your own server if you want.');
      }, 3000);

      // 3. Interactive step to click offline icon
      t2 = setTimeout(() => {
        setCurrentMessage(OFFLINE_MODAL_PROMPT);
      }, 6200);

      // 4. Wait 5 seconds during the interactive server message, then suggest switching to a mini model
      t3 = setTimeout(() => {
        setCurrentMessage(OFFLINE_SLM_PROMPT);
      }, 11200); // 6200 + 5000ms = 11200ms
    } else {
      // Server is ONLINE or Browser Model is active
      if (serverWasOfflineRef.current) {
        setCurrentMessage(
          isBrowserModel ? 'Running directly in your browser!' : 'Ah, the server is online now!'
        );
        t1 = setTimeout(() => {
          setCurrentMessage('Talk to me by typing messages here');
          tExit = setTimeout(() => {
            playExitSound();
            setDismissed(true);
          }, 3800);
        }, 2800);
      } else {
        // Online from the start
        setCurrentMessage(
          isBrowserModel ? 'Running directly in your browser!' : 'Ah, the server is online now!'
        );
        t1 = setTimeout(() => {
          setCurrentMessage('Talk to me by typing messages here');
          tExit = setTimeout(() => {
            playExitSound();
            setDismissed(true);
          }, 3800);
        }, 2800);
      }
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(tExit);
    };
  }, [isOnline, isBrowserModel]);

  const handlePuppetClick = () => {
    playTapSound();
    setBounceKey((k) => k + 1);
  };

  const isServerModalAction = currentMessage === OFFLINE_MODAL_PROMPT;
  const isSLMAction = currentMessage === OFFLINE_SLM_PROMPT;

  const handleThoughtBubbleClick = () => {
    if (isServerModalAction && onOpenServerModal) {
      playBubbleClickSound();
      onOpenServerModal();
    } else if (isSLMAction && onScrollToSLM) {
      playBubbleClickSound();
      onScrollToSLM();
    }
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.7 }}
          animate={{
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
              type: 'spring',
              stiffness: 320,
              damping: 14,
              mass: 0.8,
            },
          }}
          exit={{
            y: 90,
            opacity: 0,
            scale: 0.6,
            transition: {
              type: 'spring',
              stiffness: 280,
              damping: 20,
              duration: 0.35,
            },
          }}
          className="absolute left-0 bottom-[calc(100%-10px)] sm:bottom-[calc(100%-10px)] z-0 flex items-end gap-2.5 pointer-events-auto select-none"
        >
          {/* Layered Live2D-like Puppet Mascot with Bouncy Click Animation */}
          <motion.div
            ref={puppetRef}
            key={bounceKey}
            animate={
              bounceKey > 0
                ? {
                    scale: [1, 0.82, 1.2, 0.92, 1.08, 1],
                    y: [0, 6, -12, 3, -3, 0],
                    rotate: [0, -6, 6, -3, 2, 0],
                  }
                : {}
            }
            transition={{ duration: 0.45, ease: 'easeOut' }}
            whileTap={{ scale: 0.86 }}
            onClick={handlePuppetClick}
            title="Serafina"
            className="group relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 cursor-pointer filter drop-shadow-md z-0"
          >
            {/* Layer 5: Back Hair */}
            <img
              src={IMAGES.backHair}
              alt="Back Hair"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-[1]"
              loading="eager"
              decoding="sync"
            />

            {/* Layer 4: Torso & Neck */}
            <img
              src={IMAGES.torsoNeck}
              alt="Torso and Neck"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-[2]"
              loading="eager"
              decoding="sync"
            />

            {/* Layer 3: Face */}
            <img
              src={IMAGES.face}
              alt="Face"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-[3]"
              loading="eager"
              decoding="sync"
            />

            {/* Layer 2: Eyes Irises */}
            <img
              src={IMAGES.eyes}
              alt="Eyes"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-[4]"
              style={{
                transform: `translate3d(${eyeOffset.x}px, ${eyeOffset.y}px, 0)`,
                transition: 'transform 0.08s ease-out',
                willChange: 'transform',
              }}
              loading="eager"
              decoding="sync"
            />

            {/* Layer 1: Front Hair */}
            <img
              src={IMAGES.frontHair}
              alt="Front Hair"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-[5]"
              loading="eager"
              decoding="sync"
            />
          </motion.div>

          {/* Thought Bubble to the right side of the face */}
          <div className="relative mb-7 sm:mb-9 flex items-center z-20">
            {/* Trailing thought bubble dots */}
            <div className="absolute -left-2.5 bottom-1.5 flex flex-col items-center gap-1 pointer-events-none">
              <span className="w-2 h-2 rounded-full themed-ai-bubble border shadow-xs" />
              <span className="w-1.5 h-1.5 rounded-full themed-ai-bubble border shadow-xs -ml-1" />
            </div>

            {/* Main thought bubble container */}
            <motion.div
              layout
              onClick={handleThoughtBubbleClick}
              className={`themed-ai-bubble px-3 py-2 sm:px-3.5 sm:py-2 rounded-2xl rounded-bl-sm border shadow-lg backdrop-blur-md text-xs sm:text-sm font-medium max-w-[200px] sm:max-w-[270px] leading-snug transition-all duration-200 ${
                isServerModalAction
                  ? 'cursor-pointer hover:border-amber-500/60 hover:shadow-amber-500/10 active:scale-98 ring-1 ring-amber-500/30'
                  : isSLMAction
                  ? 'cursor-pointer hover:border-emerald-500/60 hover:shadow-emerald-500/10 active:scale-98 ring-1 ring-emerald-500/40 text-emerald-400 font-semibold'
                  : 'cursor-default'
              }`}
              title={
                isServerModalAction
                  ? 'Click to configure server'
                  : isSLMAction
                  ? 'Click to view on-device SLM models'
                  : undefined
              }
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMessage}
                  initial={{ opacity: 0, y: 4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.22 }}
                  className="break-words"
                >
                  {currentMessage}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
