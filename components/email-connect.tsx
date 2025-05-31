'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GmailConnectButton } from './gmail-connect-button';
import { Mail, AlertCircle } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { BsMicrosoft } from 'react-icons/bs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface EmailConnectProps {
  onSuccess?: () => void;
  className?: string;
}

export function EmailConnect({ onSuccess, className = '' }: EmailConnectProps) {
  // State to track if Gmail is connecting through the GmailConnectButton
  const [isGmailConnecting, setIsGmailConnecting] = useState(false);
  const gmailButtonRef = useRef<HTMLButtonElement>(null);
  
  // Control Gmail button animation state
  const [isGmailHovered, setIsGmailHovered] = useState(false);

  // Handle successful Gmail connection
  const handleGmailSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  useEffect(() => {
    if (isGmailConnecting && gmailButtonRef.current) {
      gmailButtonRef.current.click();
      setIsGmailConnecting(false);
    }
  }, [isGmailConnecting]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" },
    pressed: { scale: 0.98 }
  };

  const connectBtnVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  const googleIconVariants = {
    rest: { rotate: 0 },
    hover: { rotate: [0, -10, 10, -5, 5, 0], transition: { duration: 0.6 } }
  };

  return (
    <motion.div 
      className={`p-6 rounded-xl bg-gradient-to-br from-white to-slate-50 shadow-lg border border-slate-100 shadow-brand ${className}`}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <div className="text-center mb-6">
        <motion.h2 
          className="text-2xl font-bold text-gradient mb-2"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          Add Your Email Account
        </motion.h2>
        <motion.p 
          className="text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          Connect your email to start sending messages
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gmail Connect Option */}
        <motion.div 
          className="relative"
          variants={buttonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="pressed"
          onHoverStart={() => setIsGmailHovered(true)}
          onHoverEnd={() => setIsGmailHovered(false)}
        >
          <button
            onClick={() => setIsGmailConnecting(true)}
            disabled={isGmailConnecting}
            className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white transition-all-brand shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50"
          >
            <div className="flex items-center">
              <motion.div 
                className="flex-shrink-0 mr-3"
                variants={googleIconVariants}
                animate={isGmailHovered ? "hover" : "rest"}
              >
                <FcGoogle className="w-8 h-8" />
              </motion.div>
              <div className="text-left">
                <h3 className="font-medium text-slate-800">Gmail</h3>
                <p className="text-sm text-slate-500">Connect with Google</p>
              </div>
            </div>
            <motion.div 
              variants={connectBtnVariants}
              className="px-4 py-2 bg-brand-gradient hover:bg-brand-gradient-hover text-white rounded-md font-medium text-sm shadow-sm"
            >
              Connect
            </motion.div>
          </button>
          
          {/* Hidden real button that gets triggered */}
          <div className="hidden">
            <GmailConnectButton 
              onSuccess={handleGmailSuccess}
              ref={gmailButtonRef}
            />
          </div>
        </motion.div>
        
        {/* Outlook Option (Disabled) */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div 
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="pressed"
                className="relative"
              >
                <div className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white opacity-70 cursor-not-allowed">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-3 text-blue-600">
                      <BsMicrosoft className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-slate-800">Outlook</h3>
                      <p className="text-sm text-slate-500">Connect with Microsoft</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-md font-medium text-sm">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-800 text-white border-none">
              <p>Outlook integration coming soon!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <motion.div 
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <p className="text-xs text-slate-400">
          By connecting, you agree to our <a href="#" className="text-pink-500 hover:underline">Terms</a> and <a href="#" className="text-pink-500 hover:underline">Privacy Policy</a>
        </p>
      </motion.div>
    </motion.div>
  );
} 