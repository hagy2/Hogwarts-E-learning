"use client";
import { messaging } from "../../public/firebase";
import Image from "next/image";

import React, { useEffect } from 'react';
import {  onMessage } from 'firebase/messaging';
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/pages/home"); 
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground push notification received:', payload);
        const { title, body, image } = payload.notification!;
      
        // Use Notification API to show notifications in foreground
        new Notification(title!, {
          body: body,
          icon: image || "/default-icon.png",
        });
      });
      return () => {
        unsubscribe(); // Unsubscribe from the onMessage event
      };
    }
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm text-center sm:text-left">
          <li className="mb-2">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded">
              src/app/page.tsx
            </code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>
      </main>
    </div>
  );
}