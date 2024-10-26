"use client";

import Image from "next/image";
// import toast from "react-hot-toast";
import { useProof } from "@/hooks/useProof";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Textarea } from "@nextui-org/react";
import { Star } from "@/assets/star";
import { useState } from "react";

export default function UserTree({ params: { treeHash } }: { params: { treeProof: string } }) {
  const { requestAccountProof, isLoading } = useProof();
  const { onOpen, isOpen, onOpenChange } = useDisclosure();
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [ornamentId, setOrnamentId] = useState<number>(0);
  const [nickname, setNickname] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const spruceHandler = async () => {
    setStep(3);
    await requestAccountProof();
  };

  const ornaments = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  const addOrnamentStep = () => {
    switch (step) {
      case 1:
        return (
          <ModalContent>
            {(close) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Select Ornament</ModalHeader>
                <ModalBody className="grid grid-cols-3 gap-6">
                  {ornaments.map((num) => (
                    <div key={num} className="flex justify-center items-center">
                      <Button
                        isIconOnly
                        size="lg"
                        onClick={() => {
                          setOrnamentId(num);
                        }}
                        className={`flex justify-center items-center bg-slate-50 ${num === ornamentId ? "border border-solid border-slate-800" : ""}`}
                      >
                        <Star />
                      </Button>
                    </div>
                  ))}
                </ModalBody>
                <ModalFooter>
                  <Button onClick={close}>Close</Button>
                  <Button
                    onClick={() => {
                      setStep(2);
                    }}
                    disabled={ornamentId === 0}
                  >
                    Next
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        );
      case 2:
        return (
          <ModalContent>
            {(close) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Write Message</ModalHeader>
                <ModalBody>
                  <Input
                    value={nickname}
                    placeholder="name"
                    onChange={(e) => {
                      setNickname(e.target.value);
                    }}
                  />
                  <Textarea
                    placeholder="message.."
                    value={message}
                    minRows={3}
                    maxRows={5}
                    onChange={(e) => {
                      setMessage(e.target.value);
                    }}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button onClick={close}>Close</Button>
                  <Button color="primary" onClick={spruceHandler}>
                    Create
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        );
      case 3:
        return (
          <ModalContent>
            {(close) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Generating...</ModalHeader>
                <ModalBody>
                  <p>We are generating proof through X response.</p>
                  <p>It takes about 3 minutes. Please wait a moment 😄</p>
                </ModalBody>
                <ModalFooter>
                  <Button onClick={close} isLoading={isLoading}>
                    {isLoading ? "Loading..." : "Done"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        );
      default:
        return <></>;
    }
  };

  return (
    <>
      <main className="w-screen h-screen overflow-hidden flex flex-col justify-start items-center">
        <div className="h-dvh w-full max-w-md bg-slate-800 flex flex-col items-center justify-center gap-6">
          <div className="text-slate-300 w-full text-3xl flex justify-center items-center">Christmas Merkle Tree</div>
          <div className="image-wrapper w-full max-w-[20rem]">
            <Image src="/tree.png" alt="tree-background" width={736} height={736} />
          </div>
          <div className="button-wrapper flex gap-5 justify-center items-center flex-col">
            <Button
              className="bg-slate-400 text-slate-700 gap-2 font-medium"
              size="lg"
              onClick={() => {
                setStep(1);
                onOpen();
              }}
            >
              <span>⭐️</span>Add Ornament
            </Button>
            <Button size="lg" className="bg-slate-900 text-slate-300 gap-2" onClick={spruceHandler}>
              <span>🎄</span>Create My Tree
            </Button>
          </div>
        </div>
      </main>
      <Modal placement="bottom" size="lg" hideCloseButton isOpen={isOpen} onOpenChange={onOpenChange}>
        {addOrnamentStep()}
      </Modal>
    </>
  );
}
