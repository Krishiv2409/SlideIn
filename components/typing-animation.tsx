"use client"

import { useState, useEffect } from "react"

export function TypingAnimation() {
  const emails = [
    'hello@slidein.now',
    'student@gatech.edu',
    'founder@startup.com',
    'contact@yourdomain.io'
  ];
  const [displayText, setDisplayText] = useState('');
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [visible, setVisible] = useState(true);
  const [typingSpeed, setTypingSpeed] = useState(70);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (!visible) {
      timer = setTimeout(() => {
        setCurrentEmailIndex((prev) => (prev + 1) % emails.length);
        setIsDeleting(false);
        setDisplayText('');
        setVisible(true);
      }, 200);
      return () => clearTimeout(timer);
    }
    if (isDeleting) {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(prev => prev.slice(0, -1));
        }, 35);
      } else {
        setVisible(false);
      }
    } else {
      const currentEmail = emails[currentEmailIndex];
      if (displayText.length < currentEmail.length) {
        timer = setTimeout(() => {
          setDisplayText(currentEmail.slice(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 1200);
      }
    }
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentEmailIndex, visible, typingSpeed, emails]);

  return (
    <div className="flex justify-center mb-10">
      <div
        className={`bg-gray-50 px-6 py-4 rounded-[20px] flex items-center justify-center text-center transition-all duration-300 ease-in-out min-w-[80px] min-h-[70px] border border-gray-100 shadow-sm
          ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        <span className="font-mono text-gray-700 text-2xl animate-blink tracking-tight select-none whitespace-pre">
          {displayText}
        </span>
      </div>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500&display=swap');
        .animate-blink::after {
          content: '|';
          margin-left: 0;
          animation: blink 1s step-end infinite;
          display: inline-block;
          font-weight: 400;
        }
        @keyframes blink {
          from, to { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
} 