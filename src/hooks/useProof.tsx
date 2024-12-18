"use client";

import { useState } from "react";
import { TlsnPluginResponse } from "@/models/tlsn-response";
import { create } from "zustand";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export interface proofParams {
  req: string;
}

export interface StoreState {
  tlsn: any | undefined;
  accountProof: TlsnPluginResponse | undefined;
  friendshipProof: TlsnPluginResponse | undefined;
  revealedMessages: RevealMessage[] | undefined;
  setTlsn: (newTlsn: any) => void;
  setAccountProof: (newProof: TlsnPluginResponse) => void;
  setFriendshipProof: (newProof: TlsnPluginResponse) => void;
  setRevealedMessages: (newMessages: RevealMessage[]) => void;
}

export interface useProofResponse extends StoreState {
  isLoading: boolean;
  requestAccountProof: ({ onPageLeave }: { onPageLeave?: () => void }) => Promise<void>;
  requestFriendshipProof: ({ onPageLeave }: { onPageLeave?: () => void }) => Promise<void>;
}

export interface RevealMessage {
  hash: string;
  ornamentId: number;
  nickname: string;
  body: string;
  merkleRoot: string;
  merkleIdx: number;
  merkleProof: string;
}

export const useStore = create<StoreState>((set) => ({
  tlsn: undefined,
  accountProof: undefined,
  friendshipProof: undefined,
  revealedMessages: [],
  setTlsn: (newTlsn) => set({ tlsn: newTlsn }),
  setAccountProof: (newProof) => set({ accountProof: newProof }),
  setFriendshipProof: (newProof) => set({ friendshipProof: newProof }),
  setRevealedMessages: (newMessages) => set({ revealedMessages: newMessages }),
}));

export const useProof = () => {
  const tlsnObj = useStore((state) => state);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  // Account Proof
  const revealMessage = async ({ onPageLeave, onSuccess, treeAccountHash }: { onPageLeave?: () => void; onSuccess?: (revealedMessages: RevealMessage[]) => void; treeAccountHash: string }) => {
    if (!window.tlsn) {
      toast(
        () => (
          <div>
            <span>Please</span>
            <button style={{ color: "#0EA5E9" }} className="px-2 text-2xl" onClick={() => window.open("https://chromewebstore.google.com/detail/tlsn-extension/gcfkkledipjbgdbimfpijgbkhajiaaph")}>
              install
            </button>
            <span>TLSN extension first</span>
          </div>
        ),
        {
          id: "install-extension",
          duration: 10000,
        }
      );
      return;
    }

    let tlsn = tlsnObj.tlsn;
    let pluginId;
    const { setAccountProof, setRevealedMessages } = tlsnObj;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("Page is now inactive");
        onPageLeave?.();
      }
    };

    if (!tlsn) {
      window.addEventListener("visibilitychange", handleVisibilityChange);

      try {
        tlsn = await window.tlsn!.connect();
        tlsnObj.setTlsn(tlsn);

        const plugin = await tlsn.getPlugins("https://github.com/bigdreamtree/tlsn-plugin/raw/refs/heads/main/dist/twitter-profile.tlsn.wasm", "**", { id: "big-dream-tree-account" });

        if (plugin.length === 0) {
          const res = await tlsn.installPlugin("https://github.com/bigdreamtree/tlsn-plugin/raw/refs/heads/main/dist/twitter-profile.tlsn.wasm", { id: "big-dream-tree-account" });
          pluginId = res;
        } else {
          pluginId = plugin[0].hash;
        }
      } catch (err) {
        window.removeEventListener("visibilitychange", handleVisibilityChange);
        console.error(err);
        throw err;
      }
    }

    setIsLoading(true);

    try {
      const res: TlsnPluginResponse = await toast.promise(tlsn.runPlugin(pluginId), {
        loading: "Generating proof in progress...",
        success: "Successfully generated the proof!",
        error: "Failed to generate the proof",
      });
      console.log(res);
      setAccountProof(res);
      setIsLoading(false);

      let treeRes;
      try {
        treeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/trees/${treeAccountHash}/messages/reveal`, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          cache: "no-store",
          body: JSON.stringify({ accountProof: res }),
        });
      } catch (error) {
        if (error instanceof Error) {
          // Check if it's a 409 error (conflict)
          if ("status" in error && error.status === 409) {
            router.push(`/tree/${encodeURIComponent(res.data)}`);
          }
        }
        throw error;
      }

      const revealedMessages: RevealMessage[] = await treeRes.json();

      setRevealedMessages(revealedMessages);
      onSuccess?.(revealedMessages);

      window.removeEventListener("visibilitychange", handleVisibilityChange);
    } catch (err) {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      console.error(err);
      setIsLoading(false);
      throw err;
    }
  };

  // Account Proof
  const createMerkleTree = async ({ onPageLeave, onSuccess }: { onPageLeave?: () => void; onSuccess?: ({ accountId, accountHash, merkleRoot }: { accountId: string; accountHash: string; merkleRoot: string }) => void }) => {
    if (!window.tlsn) {
      toast(
        () => (
          <div>
            <span>Please</span>
            <button style={{ color: "#0EA5E9" }} className="px-2 text-2xl" onClick={() => window.open("https://chromewebstore.google.com/detail/tlsn-extension/gcfkkledipjbgdbimfpijgbkhajiaaph")}>
              install
            </button>
            <span>TLSN extension first</span>
          </div>
        ),
        {
          id: "install-extension",
          duration: 10000,
        }
      );
      return;
    }

    let tlsn = tlsnObj.tlsn;
    let pluginId;
    const { setAccountProof } = tlsnObj;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("Page is now inactive");
        onPageLeave?.();
      }
    };

    if (!tlsn) {
      window.addEventListener("visibilitychange", handleVisibilityChange);

      try {
        tlsn = await window.tlsn!.connect();
        tlsnObj.setTlsn(tlsn);

        const plugin = await tlsn.getPlugins("https://github.com/bigdreamtree/tlsn-plugin/raw/refs/heads/main/dist/twitter-profile.tlsn.wasm", "**", { id: "big-dream-tree-account" });

        if (plugin.length === 0) {
          const res = await tlsn.Plugin("https://github.com/bigdreamtree/tlsn-plugin/raw/refs/heads/main/dist/twitter-profile.tlsn.wasm", { id: "big-dream-tree-account" });
          pluginId = res;
        } else {
          pluginId = plugin[0].hash;
        }
      } catch (err) {
        window.removeEventListener("visibilitychange", handleVisibilityChange);
        console.error(err);
        throw err;
      }
    }

    setIsLoading(true);

    try {
      const res: TlsnPluginResponse = await toast.promise(tlsn.runPlugin(pluginId), {
        loading: "Generating proof in progress...",
        success: "Successfully generated the proof!",
        error: "Failed to generate the proof",
      });

      setAccountProof(res);
      setIsLoading(false);

      const treeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/trees`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        cache: "no-store",
        body: JSON.stringify({ accountProof: res }),
      });

      if (!treeRes.ok) {
        if (treeRes.status === 409) {
          console.log("Conflict detected");
          const decoded = decodeAccount(res.data);
          console.log(decoded);
          // router.push(`/tree/${encodeURIComponent(res.data)}`);
          return;
        }
        throw new Error(`HTTP error! status: ${treeRes.status}`);
      }

      const { accountId, accountHash, merkleRoot } = await treeRes.json();
      console.log(accountId, accountHash.toLowerCase(), merkleRoot);
      onSuccess?.({ accountId, accountHash: accountHash.toLowerCase(), merkleRoot });
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    } catch (err) {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      console.error(err);
      setIsLoading(false);
      throw err;
    }
  };

  // Friendship Proof
  const requestFriendshipProof = async ({ onPageLeave }: { onPageLeave?: () => void }) => {
    if (!window.tlsn) {
      toast(
        () => (
          <div>
            <span>Please</span>
            <button style={{ color: "#0EA5E9" }} className="px-2 text-2xl" onClick={() => window.open("https://chromewebstore.google.com/detail/tlsn-extension/gcfkkledipjbgdbimfpijgbkhajiaaph")}>
              install
            </button>
            <span>TLSN extension first</span>
          </div>
        ),
        {
          id: "install-extension",
          duration: 10000,
        }
      );
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("Page is now inactive");
        onPageLeave?.();
      }
    };
    window.addEventListener("visibilitychange", handleVisibilityChange);

    let tlsn = tlsnObj.tlsn;
    let pluginId;
    const { setFriendshipProof } = tlsnObj;

    if (!tlsn) {
      try {
        tlsn = await window.tlsn!.connect();
        tlsnObj.setTlsn(tlsn);
        const plugin = await tlsn.getPlugins("https://github.com/bigdreamtree/tlsn-plugin/raw/refs/heads/main/dist/x-following-check.tlsn.wasm", "**", { id: "big-dream-tree-friendship-main" });
        if (plugin.length === 0) {
          const res = await tlsn.installPlugin("https://github.com/bigdreamtree/tlsn-plugin/raw/refs/heads/main/dist/x-following-check.tlsn.wasm", { id: "big-dream-tree-friendship-main" });
          pluginId = res;
        } else {
          pluginId = plugin[0].hash;
        }
      } catch (err) {
        window.removeEventListener("visibilitychange", handleVisibilityChange);
        console.error(err);
        throw err;
      }
    }

    setIsLoading(true);

    try {
      const res: TlsnPluginResponse = await toast.promise(tlsn.runPlugin(pluginId), {
        loading: "Generating proof in progress...",
        success: "Successfully generated the proof!",
        error: "Failed to generate the proof",
      });
      setFriendshipProof(res);
      console.log(res);
      decodeAndSetAccountProof(res.data);

      setIsLoading(false);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    } catch (err) {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      console.error(err);
      setIsLoading(false);
      throw err;
    }
  };

  function extractJsonData(decodedString: string): string | null {
    const jsonStartIndex = decodedString.indexOf('{"data":');

    if (jsonStartIndex === -1) {
      console.log("JSON data not found");
      return null;
    }

    const jsonEndIndex = decodedString.lastIndexOf("}"); // Find the last closing brace
    if (jsonEndIndex === -1 || jsonEndIndex < jsonStartIndex) {
      console.log("Closing brace not found");
      return null;
    }

    return decodedString.slice(jsonStartIndex, jsonEndIndex + 1); // Include the last brace
  }

  function checkFollowStatus(jsonString: string): boolean {
    try {
      const jsonData = JSON.parse(jsonString);

      const followedBy = jsonData.data.user.result.legacy.followed_by;
      const following = jsonData.data.user.result.legacy.following;

      if (followedBy === true && following === true) {
        return true;
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }

    return false;
  }

  function decodeAccount(dataHex: string): string {
    if (dataHex.startsWith("0x")) {
      dataHex = dataHex.slice(2);
    }

    const dataBytes = new Uint8Array(dataHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));

    //
    const encodings = ["utf-8", "ascii", "iso-8859-1", "utf-16le", "utf-16be"];

    for (const encoding of encodings) {
      try {
        const decoded = new TextDecoder(encoding).decode(dataBytes);
        console.log(`${encoding} 디코딩 결과:`, decoded);

        // JSON 데이터가 있는지 확인
        if (decoded.includes('{"data":')) {
          return decoded;
        }
      } catch (e) {
        console.log(`${encoding} 디코딩 실패:`, e);
      }
    }
    //

    const decodedString = new TextDecoder("utf-8").decode(dataBytes);

    const jsonString = extractJsonData(decodedString);

    if (!jsonString) {
      return "";
    }

    try {
      const jsonData = JSON.parse(jsonString);

      console.log(jsonData);

      const screenName = jsonData.data.user.result.screen_name;

      return screenName;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw error;
    }
  }

  function decodeAndSetAccountProof(dataHex: string): string | null {
    if (dataHex.startsWith("0x")) {
      dataHex = dataHex.slice(2);
    }

    const dataBytes = new Uint8Array(dataHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
    const decodedString = new TextDecoder("utf-8").decode(dataBytes);
    console.log(decodedString);
    const jsonString = extractJsonData(decodedString);

    if (jsonString && checkFollowStatus(jsonString)) {
      return jsonString;
    } else {
      console.log("Conditions not met:", jsonString);
      return null;
    }
    // setAccountProof(decodedHex);
  }

  return { ...tlsnObj, isLoading, revealMessage, requestFriendshipProof, createMerkleTree };
};
