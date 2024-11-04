"use client";
import { useState } from "react";
import { TlsnPluginResponse } from "@/models/tlsn-response";
import { create } from "zustand";
import toast from "react-hot-toast";
import { useRouter, usePathname } from "next/navigation";

export interface proofParams {
  req: string;
}

export interface StoreState {
  tlsn: any | undefined;
  accountProof: TlsnPluginResponse | undefined;
  friendshipProof: TlsnPluginResponse | undefined;
  setTlsn: (newTlsn: any) => void;
  setAccountProof: (newProof: TlsnPluginResponse) => void;
  setFriendshipProof: (newProof: TlsnPluginResponse) => void;
}

export interface useProofResponse extends StoreState {
  isLoading: boolean;
  requestAccountProof: ({ onPageLeave }: { onPageLeave?: () => void }) => Promise<void>;
  requestFriendshipProof: ({ onPageLeave }: { onPageLeave?: () => void }) => Promise<void>;
}

export const useStore = create<StoreState>((set) => ({
  tlsn: undefined,
  accountProof: undefined,
  friendshipProof: undefined,
  setTlsn: (newTlsn) => set({ tlsn: newTlsn }),
  setAccountProof: (newProof) => set({ accountProof: newProof }),
  setFriendshipProof: (newProof) => set({ friendshipProof: newProof }),
}));

export const useProof = () => {
  const tlsnObj = useStore((state) => state);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  // Account Proof
  const requestAccountProof = async ({ onPageLeave, onSuccess }: { onPageLeave?: () => void; onSuccess?: ({ accountId, accountHash, merkleRoot }: { accountId: string; accountHash: string; merkleRoot: string }) => void }) => {
    if (!window.tlsn) {
      toast("Please install TLSN extension first");
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
        treeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/trees`, {
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
      toast("Please install TLSN extension first");
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
      window.open(`https://x.com/0xdarron`, "_blank");
      const res: TlsnPluginResponse = await toast.promise(tlsn.runPlugin(pluginId), {
        loading: "Generating proof in progress...",
        success: "Successfully generated the proof!",
        error: "Failed to generate the proof",
      });
      setFriendshipProof(res);
      console.log(res);
      await decodeAndSetAccountProof(res.data);

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

  async function decodeAndSetAccountProof(dataHex: string): Promise<string | null> {
    if (dataHex.startsWith("0x")) {
      dataHex = dataHex.slice(2);
    }

    const dataBytes = new Uint8Array(dataHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
    const decodedString = new TextDecoder("utf-8").decode(dataBytes);

    const jsonString = extractJsonData(decodedString);

    if (jsonString && checkFollowStatus(jsonString)) {
      return jsonString;
    } else {
      console.log("Conditions not met:", jsonString);
      return null;
    }
    // setAccountProof(decodedHex);
  }

  return { ...tlsnObj, isLoading, requestAccountProof, requestFriendshipProof };
};
