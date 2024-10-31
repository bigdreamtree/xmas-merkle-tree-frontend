"use client";

import Image from "next/image";
import { Button } from "@nextui-org/react";
import { useState } from "react";
import { decodeBase64 } from "@/funcs/base64";
import { useProof } from "@/hooks/useProof";
import toast from "react-hot-toast";
import { Input, Textarea } from "@nextui-org/react";

export default function UserTree({ params: { encodedHandle } }: { params: { encodedHandle: string } }) {
  const [userHandler] = useState<string>(decodeBase64(encodedHandle));
  const [ornamentId, setOrnamentId] = useState<number>(-1);
  const [nickname, setNickname] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [steps, setSteps] = useState<0 | 1 | 2 | 3>(0);

  const { requestFriendshipProof, friendshipProof, isLoading } = useProof();

  return (
    <main className="w-screen h-screen overflow-hidden flex flex-col justify-start items-center">
      {steps === 0 && (
        <div className="absolute top-10 right-10 flex flex-col justify-start items-center gap-1">
          <Button
            isIconOnly
            className="!bg-transparent hover:!bg-transparent"
            disableRipple
            variant="light"
            size="lg"
            onClick={() => {
              // setSteps(0);
            }}
          >
            <Image src="/tree-button.png" alt="tree-button" priority width={50} height={50} />
          </Button>
          <span className="text-white text-xl">My Tree</span>
        </div>
      )}
      {steps === 0 && (
        <div className="h-dvh w-full max-w-md flex flex-col items-center justify-center gap-8 animate-fadeIn">
          <div className="text-white w-full text-4xl flex justify-center items-center gap-4">
            <a href={`https://x.com/${userHandler}`} target="_blank" rel="noopener noreferrer">
              <span className="text-amp">@{userHandler}</span>
            </a>
            <span>Merkle Tree</span>
          </div>
          <div className="image-wrapper relative w-[500px]">
            <Image src="/tree.png" alt="tree-background" priority width={657} height={657} />
            {/* <div className="absolute top-[6rem] left-1/2 -translate-x-1/2 flex justify-center items-center">
              <div className="h-8 w-8 bg-yellow-400 rounded-full" />  
            </div>
            <div className="absolute top-[9rem] left-1/2 -translate-x-1/2 flex justify-center items-center gap-6">
              <div className="h-8 w-8 bg-yellow-400 rounded-full" />
            </div>
            <div className="absolute top-[17rem] left-1/2 -translate-x-1/2 flex justify-center items-center gap-9">
              <div className="h-8 w-8 bg-yellow-400 rounded-full" />
            </div>
            <div className="absolute top-[24rem] left-1/2 -translate-x-1/2 flex justify-center items-center gap-9">
              <div className="h-8 w-8 bg-yellow-400 rounded-full" />
            </div> */}
          </div>
          <div className="button-wrapper flex gap-5 justify-center items-center flex-col">
            <div className="button-gradient">
              <Button
                variant="light"
                className="text-white gap-2 w-[300px] font-medium !block z-10 text-2xl hover:!bg-transparent"
                disableRipple
                radius="full"
                size="lg"
                onClick={() => {
                  requestFriendshipProof({
                    onPageLeave: () => {
                      if (steps === 0) setSteps(1);
                    },
                  });
                }}
              >
                Send My Present
              </Button>
            </div>
          </div>
        </div>
      )}
      {steps === 1 && (
        <div className="h-dvh w-full flex flex-col items-center justify-center gap-8 animate-fadeIn">
          <div className="text-white w-full text-4xl flex justify-center items-center gap-4">
            <span>Select Your Gifts</span>
          </div>
          <div className="image-wrapper relative w-[500px] h-[500px] gap-12 flex flex-col justify-center items-center">
            <div className="grid grid-cols-3 gap-12 w-full">
              <div className="flex justify-center items-center">
                <Button
                  isIconOnly
                  variant="light"
                  size="lg"
                  onClick={() => {
                    setOrnamentId(0);
                  }}
                  className={`ornaments-gradient flex justify-center items-center rounded-[30px] hover:!bg-transparent ${ornamentId === 0 && "bg-gradient-to-r from-[#ff7878] to-[#f7e96c]"}`}
                >
                  <Image src="/box.png" alt="ornaments:box" height={120} width={120} />
                </Button>
              </div>
              <div className="flex justify-center items-center">
                <Button
                  isIconOnly
                  variant="light"
                  size="lg"
                  onClick={() => {
                    setOrnamentId(1);
                  }}
                  className={`ornaments-gradient flex justify-center items-center rounded-[30px] hover:!bg-transparent ${ornamentId === 1 && "bg-gradient-to-r from-[#ff7878] to-[#f7e96c]"}`}
                >
                  <Image src="/snowman.png" alt="ornaments:snowman" height={120} width={120} />
                </Button>
              </div>
              <div className="flex justify-center items-center">
                <Button
                  isIconOnly
                  variant="light"
                  size="lg"
                  onClick={() => {
                    setOrnamentId(2);
                  }}
                  className={`ornaments-gradient flex justify-center items-center rounded-[30px] hover:!bg-transparent ${ornamentId === 2 && "bg-gradient-to-r from-[#ff7878] to-[#f7e96c]"}`}
                >
                  <Image src="/cookie.png" alt="ornaments:cookie" height={120} width={120} />
                </Button>
              </div>
            </div>
            <div className="flex gap-12 w-full justify-center">
              <div className="flex justify-center items-center">
                <Button
                  isIconOnly
                  variant="light"
                  size="lg"
                  onClick={() => {
                    setOrnamentId(3);
                  }}
                  className={`ornaments-gradient flex justify-center items-center rounded-[30px] hover:!bg-transparent ${ornamentId === 3 && "bg-gradient-to-r from-[#ff7878] to-[#f7e96c]"}`}
                >
                  <Image src="/stick.png" alt="ornaments:stick" height={120} width={120} />
                </Button>
              </div>
              <div className="flex justify-center items-center">
                <Button
                  isIconOnly
                  variant="light"
                  size="lg"
                  onClick={() => {
                    setOrnamentId(4);
                  }}
                  className={`ornaments-gradient flex justify-center items-center rounded-[30px] hover:!bg-transparent ${ornamentId === 4 && "bg-gradient-to-r from-[#ff7878] to-[#f7e96c]"}`}
                >
                  <Image src="/socks.png" alt="ornaments:socks" height={120} width={120} />
                </Button>
              </div>
            </div>
          </div>
          <div className="button-wrapper flex gap-5 justify-center items-center flex-col">
            <div className="button-gradient">
              <Button
                variant="light"
                className="text-white gap-2 font-medium !block z-10 text-2xl hover:!bg-transparent"
                disableRipple
                radius="full"
                size="lg"
                onClick={() => {
                  if (ornamentId > -1) {
                    setSteps(2);
                  } else {
                    toast("Please select your gift 🎁");
                  }
                }}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
      {steps === 2 && (
        <div className="h-dvh w-full flex flex-col items-center justify-center gap-8 animate-fadeIn">
          <div className="text-white w-full text-4xl flex justify-center items-center gap-4 mb-12">
            <span>Send Your Friend a Secret Christmas Letter</span>
          </div>
          <div className="w-[750px] h-[450px] bg-[url('/letter-background.png')] bg-cover bg-center bg-no-repeat rounded-[30px] p-12 flex flex-col justify-start items-center gap-4">
            <Input
              value={nickname}
              placeholder="Your Name"
              className="!bg-transparent"
              classNames={{
                input: ["!text-letter text-[36px] placeholder:text-[#A5813F]"],
                innerWrapper: ["bg-transparent"],
                inputWrapper: ["bg-transparent hover:!bg-transparent active:!bg-transparent shadow-none focus:!bg-transparent group-data-[focus=true]:!bg-transparent"],
              }}
              onChange={(e) => {
                setNickname(e.target.value);
              }}
            />
            <Textarea
              placeholder="Type Your Message Here ..."
              className="!bg-transparent"
              classNames={{
                input: ["!text-letter text-[32px] placeholder:text-[#A5813F]"],
                innerWrapper: ["bg-transparent"],
                inputWrapper: ["bg-transparent hover:!bg-transparent active:!bg-transparent shadow-none focus:!bg-transparent group-data-[focus=true]:!bg-transparent"],
              }}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
            />
          </div>
          <div className="button-wrapper flex gap-5 justify-center items-center flex-col">
            <div className={isLoading ? "button-gradient-disabled" : "button-gradient"}>
              <Button
                variant="light"
                className="text-white gap-2 font-medium !block z-10 text-2xl hover:!bg-transparent"
                disabled={isLoading}
                disableRipple
                radius="full"
                size="lg"
                onClick={() => {
                  if (nickname.length > 0 && message.length > 0) {
                    setSteps(3);
                  } else {
                    toast("Please fill in all the fields 🧐");
                  }
                }}
              >
                {isLoading ? "Please wait for processing" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {steps === 3 && (
        <div className="h-dvh w-full max-w-md flex flex-col items-center justify-center gap-8 animate-fadeIn">
          <div className="text-white w-full text-4xl flex justify-center items-center">
            <span>Your Gift has been Sent!</span>
          </div>
          <div className="image-wrapper relative w-full">
            <Image src="/done.png" alt="tree-background" priority width={500} height={437.5} />
          </div>
          <div className="button-wrapper flex gap-5 justify-center items-center flex-col">
            <div className="button-gradient">
              <Button
                variant="light"
                className="text-white gap-2 font-medium !block z-10 text-2xl hover:!bg-transparent"
                disableRipple
                radius="full"
                size="lg"
                onClick={() => {
                  setSteps(0);
                }}
              >
                Return to Tree
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
