"use client";
import { useState } from "react";
import { TlsnPluginResponse } from "@/models/tlsn-response";
import { create } from "zustand";
import toast from "react-hot-toast";

export interface proofParams {
  req: string;
}

export interface StoreState {
  tlsn: any | undefined;
  accountProof: string | undefined;
  friendshipProof: string | undefined;
  setTlsn: (newTlsn: any) => void;
  setAccountProof: (newProof: string) => void;
  setFriendshipProof: (newProof: string) => void;
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
      setAccountProof(res.data);
      setIsLoading(false);

      //   //
      //   // Create Presentation object to parse the proof
      //   const presentation = await new tlsn.Presentation(res.data);
      //   const verifierOutput = await presentation.verify();

      //   // Create Transcript to get human-readable data
      //   const transcript = new tlsn.Transcript({
      //     sent: verifierOutput.transcript.sent,
      //     recv: verifierOutput.transcript.recv,
      //   });

      //   // Add readable transcript to response
      //   res.transcript = {
      //     sent: transcript.sent(),
      //     recv: transcript.recv(),
      //   };

      //   setAccountProof(res.data);
      //   console.log("Human readable response:", res.transcript.recv);
      //   //

      const treeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/trees`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ accountProof: res }),
      });

      const { accountId, accountHash, merkleRoot } = await treeRes.json();
      console.log(accountId, accountHash, merkleRoot);
      onSuccess?.({ accountId, accountHash, merkleRoot });

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

        const plugin = await tlsn.getPlugins("https://github.com/bigdreamtree/tlsn-plugin/raw/refs/heads/darron/dist/x-following-check.tlsn.wasm", "**", { id: "big-dream-tree-friendship-darron" });

        if (plugin.length === 0) {
          const res = await tlsn.installPlugin("https://github.com/bigdreamtree/tlsn-plugin/raw/refs/heads/darron/dist/x-following-check.tlsn.wasm", { id: "big-dream-tree-friendship-darron" });
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
      setFriendshipProof(res.data);
      console.log(res);
      console.log(await decodeAndSetAccountProof(res.data));

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
