import { create } from "zustand";
import { TlsnPluginResponse } from "@/models/tlsn-response";
import { useState } from "react";
import { TLSN_ACCOUNT_PLUGIN } from "@/constants/tlsn-plugin";

export interface proofParams {
  req: string;
}

export interface StoreState {
  proof: string | undefined;
  tlsn: any | undefined;
  setTlsn: (newTlsn: any) => void;
  setProof: (newProof: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  proof: undefined,
  tlsn: undefined,
  setTlsn: (newTlsn) => set({ tlsn: newTlsn }),
  setProof: (newProof) => set({ proof: newProof }),
}));

export const useProof = () => {
  const tlsnObj = useStore((state) => state);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const requestAccountProof = async () => {
    let tlsn = tlsnObj.tlsn;
    const { setProof } = tlsnObj;

    if (!tlsn) {
      tlsn = await window.tlsn.connect();
      tlsnObj.setTlsn(tlsn);
    }

    setIsLoading(true);

    try {
      const res: TlsnPluginResponse = await tlsn.runPlugin(TLSN_ACCOUNT_PLUGIN);
      setProof(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return { ...tlsnObj, isLoading, requestAccountProof };
};
