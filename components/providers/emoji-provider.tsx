"use client"

import { PropsWithChildren } from "react"
import { EmojiProvider as AppleEmojiProvider } from "react-apple-emojis"
import emojiData from "react-apple-emojis/src/data.json"

export function EmojiProvider({ children }: PropsWithChildren) {
  return (
    <AppleEmojiProvider data={emojiData}>
      {children}
    </AppleEmojiProvider>
  )
} 