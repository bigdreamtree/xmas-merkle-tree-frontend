import { create } from "zustand";
import { TlsnPluginResponse } from "@/models/tlsn-response";
import { useState } from "react";
// import { TLSN_ACCOUNT_PLUGIN, TLSN_FRIENDSHIP_PLUGIN } from "@/constants/tlsn-plugin";
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
  const requestAccountProof = async ({ onPageLeave }: { onPageLeave?: () => void }) => {
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
      setAccountProof(res.data);
      setIsLoading(false);

      const treeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/trees`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ accountProof: res.data }),
      });

      const accountId = await treeRes.json();
      console.log(accountId);

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

        const plugin = await tlsn.getPlugins("https://github.com/bigdreamtree/tlsn-plugin/raw/refs/heads/main/dist/x-following-check.tlsn.wasm", "**", { id: "big-dream-tree-friendship" });

        if (plugin.length === 0) {
          const res = await tlsn.installPlugin("https://github.com/bigdreamtree/tlsn-plugin/raw/refs/heads/main/dist/x-following-check.tlsn.wasm", { id: "big-dream-tree-friendship" });
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
      setIsLoading(false);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    } catch (err) {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      console.error(err);
      setIsLoading(false);
      throw err;
    }
  };

  return { ...tlsnObj, isLoading, requestAccountProof, requestFriendshipProof };
};
