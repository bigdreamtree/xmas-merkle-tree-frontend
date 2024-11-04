"use client";

import Image from "next/image";
import { useState } from "react";
import { useProof } from "@/hooks/useProof";
import { useRouter } from "next/navigation";

export default function UserTree() {
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const router = useRouter();

  const { createMerkleTree } = useProof();

  return (
    <main className="w-screen h-screen overflow-hidden flex flex-col justify-start items-center">
      {pageLoading ? (
        <div className="h-dvh w-full flex flex-col items-center justify-center gap-8 animate-fadeIn">
          <div className="text-white w-full text-5xl flex justify-center items-center gap-4">
            <span className="text-amp">Christmas</span>
            <span>Merkle Tree</span>
          </div>
          <div className="relative image-wrapper flex justify-center items-center">
            <Image src="/tree.png" alt="tree-background" priority width={657} height={657} className="brightness-50" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-4xl">
              Proof Generating
              <span className="loading-dots">.</span>
              <span className="loading-dots" style={{ animationDelay: "0.2s" }}>
                .
              </span>
              <span className="loading-dots" style={{ animationDelay: "0.4s" }}>
                .
              </span>
            </span>
          </div>
        </div>
      ) : (
        <div className="h-dvh w-full flex flex-col items-center justify-center gap-8 animate-fadeIn">
          <div className="text-white w-full text-5xl flex justify-center items-center gap-4">
            <span className="text-amp">Christmas</span>
            <span>Merkle Tree</span>
          </div>
          <div className="relative image-wrapper flex justify-center items-center">
            <Image src="/tree.png" alt="tree-background" priority width={657} height={657} className="brightness-50" />
            <span
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-6xl cursor-pointer"
              onClick={() => {
                createMerkleTree({
                  onPageLeave: () => {
                    setPageLoading(true);
                  },
                  onSuccess: ({ accountId }) => {
                    setPageLoading(false);
                    router.push(`/tree/${encodeURIComponent(accountId)}`);
                  },
                });
              }}
            >
              ( Tap Here )
            </span>
          </div>
        </div>
      )}
    </main>
  );
}
