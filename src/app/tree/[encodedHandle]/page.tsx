"use client";

import Image from "next/image";
import { Button } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { useProof, type RevealMessage } from "@/hooks/useProof";
import toast from "react-hot-toast";
import { Input, Textarea, Tooltip } from "@nextui-org/react";
import { sha256, toHex } from "viem";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function UserTree({ params: { encodedHandle } }: { params: { encodedHandle: string } }) {
  const queryClient = useQueryClient();

  const [userHandler] = useState<string>(decodeURIComponent(encodedHandle));
  const [accountHash] = useState<string>(
    sha256(toHex(decodeURIComponent(encodedHandle)))
      .toLowerCase()
      .slice(2)
  );
  const [ornamentId, setOrnamentId] = useState<number>(-1);
  const [nickname, setNickname] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [steps, setSteps] = useState<0 | 1 | 2 | 3>(0);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const router = useRouter();
  const [daysUntilChristmas, setDaysUntilChristmas] = useState<number>(-1);
  const [addMsgLoading, setAddMsgLoading] = useState<boolean>(false);
  const [pageReveal, setPageReveal] = useState<boolean>(false);
  const [revealLoading, setRevealLoading] = useState<boolean>(false);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [messageOpen, setMessageOpen] = useState<-1 | 0 | 1 | 2 | 3 | 4>(-1);

  const { requestFriendshipProof, revealMessage, isLoading, friendshipProof, revealedMessages } = useProof();

  // Query for fetching messages
  const { data: messages } = useQuery({
    queryKey: ["messages", accountHash],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/trees/${accountHash}/messages`, {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        method: "GET",
      });
      return res.json();
    },
  });

  useEffect(() => {
    const today = new Date();
    const christmas = new Date(today.getFullYear(), 11, 25); // Month is 0-based, so 11 = December

    // If Christmas has passed this year, calculate for next year
    if (today > christmas) {
      christmas.setFullYear(christmas.getFullYear() + 1);
    }

    const timeDiff = christmas.getTime() - today.getTime() > 0 ? christmas.getTime() - today.getTime() : 0;
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    setDaysUntilChristmas(daysDiff);
  }, []);

  const addMsgHandler = async () => {
    setAddMsgLoading(true);
    try {
      await toast.promise(
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/trees/${accountHash}/messages`, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          cache: "no-store",
          body: JSON.stringify({ ornamentId, nickname, body: message, friendshipProof }),
        }),
        {
          loading: "Sending your gift...",
          success: "Successfully sent your gift!",
          error: "Failed to send your gift",
        }
      );

      await queryClient.invalidateQueries({ queryKey: ["messages", accountHash] });
      await queryClient.refetchQueries({ queryKey: ["messages", accountHash] });

      setAddMsgLoading(false);
      setSteps(3);
    } catch {
      setAddMsgLoading(false);
      toast.error("Failed to send your gift");
    }
  };

  console.log(messageOpen);

  return (
    <main className="w-screen h-screen overflow-hidden flex flex-col justify-start items-center">
      {/** Global Loading */}
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
      ) : // Page Reveal
      pageReveal ? (
        <div className="h-dvh w-full flex flex-col items-center justify-center gap-8 animate-fadeIn">
          <div className="text-white w-full text-5xl flex justify-center items-center gap-6">
            <span className="text-white">Verifying your merkle tree 🎄</span>
          </div>
          <div className="w-[750px] h-[600px] bg-[url('/letter-background.png')] bg-cover bg-center bg-no-repeat rounded-[30px] p-12 flex flex-col justify-between items-center">
            <div className="text-2xl flex flex-col justify-start items-start w-full">
              <span>Root</span>
              <span className="text-letter">{`${revealedMessages?.[0]?.merkleRoot}`}</span>
            </div>
            <div className="w-full h-full flex justify-center items-center flex-col gap-3">
              <div className={`flex justify-between items-center w-full border-b-1.5 border-letter border-opacity-20`}>
                <span className="text-2xl text-letter">Orn.</span>
                <span className="text-2xl w-[200px] text-center text-letter">Nickname</span>
                <span className="text-2xl w-[150px] truncate text-center text-letter">Message</span>
                <span className="text-2xl w-[150px] truncate text-center text-letter">Proof</span>
              </div>
              {revealedMessages?.map((msg: RevealMessage, idx: number) => (
                <div key={msg.merkleProof} className={`flex justify-between items-center w-full`} style={{ animation: `fadeIn ${0.5 * (idx + 1)}s ease-in-out forwards` }}>
                  <span className="text-2xl">
                    <Image
                      src={msg.ornamentId === 0 ? "/box.png" : msg.ornamentId === 1 ? "/cookie.png" : msg.ornamentId === 2 ? "/snowman.png" : msg.ornamentId === 3 ? "/stick.png" : "/socks.png"}
                      alt="tree-button"
                      priority
                      width={36}
                      height={36}
                      className=""
                    />
                  </span>
                  <span className="text-2xl w-[200px] text-center">{msg.nickname}</span>
                  <span className="text-2xl text-letter w-[150px] truncate">{`${msg.hash}`}</span>
                  <span className="text-2xl text-letter w-[150px] truncate">{`${msg.merkleProof}`}</span>
                </div>
              ))}
            </div>
            <div className="w-full flex justify-center items-center">
              <Button
                variant="solid"
                size="lg"
                isLoading={!revealLoading}
                onClick={() => {
                  if (revealed) {
                    setPageReveal(false);
                    return;
                  }
                  setRevealLoading(true);
                  // verifyMerkleTree();
                  setTimeout(() => {
                    setRevealLoading(false);
                    setRevealed(true);
                  }, 4000);
                }}
                className="text-2xl bg-letter bg-opacity-80 text-white rounded-full transition-all duration-500 [&_span]:!text-[16px]"
              >
                {revealed ? "Revealed ✅" : "Reveal 📭"}
              </Button>
            </div>
          </div>
        </div>
      ) : // Message Open
      messageOpen > -1 ? (
        <div className="h-dvh w-full flex flex-col items-center justify-center gap-8 animate-fadeIn">
          <div className="text-white w-full text-4xl flex justify-center items-center gap-4 mb-12">
            <span>Message</span>
          </div>
          <div className="relative w-[750px] h-[450px] bg-[url('/letter-background.png')] bg-cover bg-center bg-no-repeat rounded-[30px] p-12 flex flex-col justify-start items-center gap-4">
            <Image
              src={messageOpen === 0 ? "/box.png" : messageOpen === 1 ? "/cookie.png" : messageOpen === 2 ? "/snowman.png" : messageOpen === 3 ? "/stick.png" : "/socks.png"}
              alt="letter"
              priority
              width={120}
              height={120}
              className="absolute -bottom-8 -right-8 -translate-y-1/2 -translate-x-1/2"
            />
            <Input
              value={revealedMessages?.find((msg) => msg.ornamentId === messageOpen)?.nickname || ""}
              // placeholder="Nickname"
              disabled
              className="!bg-transparent uppercase"
              classNames={{
                input: ["!text-letter text-[36px] placeholder:text-[#A5813F]"],
                innerWrapper: ["bg-transparent"],
                inputWrapper: ["bg-transparent hover:!bg-transparent active:!bg-transparent shadow-none focus:!bg-transparent group-data-[focus=true]:!bg-transparent"],
              }}
            />
            <Textarea
              className="!bg-transparent"
              disabled
              classNames={{
                input: ["!text-letter text-[32px] placeholder:text-[#A5813F]"],
                innerWrapper: ["bg-transparent"],
                inputWrapper: ["bg-transparent hover:!bg-transparent active:!bg-transparent shadow-none focus:!bg-transparent group-data-[focus=true]:!bg-transparent"],
              }}
              value={revealedMessages?.find((msg) => msg.ornamentId === messageOpen)?.body || ""}
            />
          </div>
          <div className="button-wrapper flex gap-5 justify-center items-center flex-col">
            <div className="button-gradient">
              <Button
                variant="light"
                className={`text-white gap-2 font-medium !block z-10 text-2xl hover:!bg-transparent`}
                radius="full"
                size="lg"
                onClick={() => {
                  setMessageOpen(-1);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // tree page
        <>
          {steps === 0 && (
            <div className="absolute top-10 px-10 left-1/2 -translate-x-1/2 flex w-full justify-between items-center">
              <div className="flex flex-col justify-start items-center gap-1">
                <Button
                  isIconOnly
                  className="!bg-transparent hover:!bg-transparent"
                  disableRipple
                  variant="light"
                  size="lg"
                  onClick={() => {
                    if (daysUntilChristmas === 0 || 1) {
                      revealMessage({
                        treeAccountHash: accountHash,
                        onPageLeave: () => {
                          setPageLoading(true);
                        },
                        onSuccess: (revealedMessages: RevealMessage[]) => {
                          setPageLoading(false);
                          setPageReveal(true);
                          console.log(revealedMessages);
                        },
                      });
                    }
                  }}
                >
                  <Image src="/dday.png" alt="tree-button" priority width={50} height={50} />
                </Button>
                {daysUntilChristmas >= 0 ? daysUntilChristmas > 0 ? <span className="text-white text-2xl">D-{daysUntilChristmas}</span> : <span className="text-white text-2xl">D-Day</span> : <span className="text-white text-2xl opacity-0">day</span>}
              </div>
              <div className="flex flex-col justify-center items-center gap-1">
                <Button
                  isIconOnly
                  className="!bg-transparent hover:!bg-transparent"
                  disableRipple
                  variant="light"
                  size="lg"
                  onClick={() => {
                    router.push(`/`);
                  }}
                >
                  <Image src="/tree-button.png" alt="tree-button" priority width={50} height={50} />
                </Button>
                <span className="text-white text-xl">My Tree &gt;</span>
              </div>
            </div>
          )}
          {/** Default */}
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
                {messages?.find((msg: any) => msg.ornamentId === 3) && (
                  <div className="absolute top-[6rem] left-1/2 -translate-x-[calc(50%+50px)] flex justify-center items-center">
                    <Tooltip offset={0} size="lg" showArrow content={messages?.find((msg: any) => msg.ornamentId === 3)?.nickname}>
                      <Image
                        src="/stick.png"
                        alt="stick-button"
                        priority
                        width={100}
                        height={100}
                        className="cursor-pointer"
                        onClick={() => {
                          if (revealed) {
                            setMessageOpen(3);
                          }
                        }}
                      />
                    </Tooltip>
                  </div>
                )}
                {messages?.find((msg: any) => msg.ornamentId === 0) && (
                  <div className="absolute top-[6.5rem] left-1/2 -translate-x-[calc(50%-80px)] flex justify-center items-center gap-6">
                    <Tooltip offset={0} size="lg" showArrow content={messages?.find((msg: any) => msg.ornamentId === 0)?.nickname}>
                      <Image
                        src="/box.png"
                        alt="tree-button"
                        priority
                        width={100}
                        height={100}
                        className="cursor-pointer"
                        onClick={() => {
                          if (revealed) {
                            setMessageOpen(0);
                          }
                        }}
                      />
                    </Tooltip>
                  </div>
                )}
                {messages?.find((msg: any) => msg.ornamentId === 1) && (
                  <div className="absolute top-[12rem] left-1/2 -translate-x-[calc(50%)] flex justify-center items-center gap-9">
                    <Tooltip offset={0} size="lg" showArrow content={messages?.find((msg: any) => msg.ornamentId === 1)?.nickname}>
                      <Image
                        src="/cookie.png"
                        alt="tree-button"
                        priority
                        width={100}
                        height={100}
                        className="cursor-pointer"
                        onClick={() => {
                          if (revealed) {
                            setMessageOpen(1);
                          }
                        }}
                      />
                    </Tooltip>
                  </div>
                )}
                {messages?.find((msg: any) => msg.ornamentId === 2) && (
                  <div className="absolute top-[14.5rem] left-1/2 -translate-x-[calc(50%-110px)] flex justify-center items-center gap-9">
                    <Tooltip offset={0} size="lg" showArrow content={messages?.find((msg: any) => msg.ornamentId === 2)?.nickname}>
                      <Image
                        src="/snowman.png"
                        alt="tree-button"
                        priority
                        width={100}
                        height={100}
                        className="cursor-pointer"
                        onClick={() => {
                          if (revealed) {
                            setMessageOpen(2);
                          }
                        }}
                      />
                    </Tooltip>
                  </div>
                )}
                {messages?.find((msg: any) => msg.ornamentId === 4) && (
                  <div className="absolute top-[16.5rem] left-1/2 -translate-x-[calc(50%+110px)] flex justify-center items-center gap-9">
                    <Tooltip offset={0} size="lg" showArrow content={messages?.find((msg: any) => msg.ornamentId === 4)?.nickname}>
                      <Image
                        src="/socks.png"
                        alt="tree-button"
                        priority
                        width={100}
                        height={100}
                        className="cursor-pointer"
                        onClick={() => {
                          if (revealed) {
                            setMessageOpen(4);
                          }
                        }}
                      />
                    </Tooltip>
                  </div>
                )}
              </div>
              <div className={`button-wrapper flex gap-5 justify-center items-center flex-col`}>
                <div className={`button-gradient`}>
                  <Button
                    variant="light"
                    // className="text-white gap-2 w-[300px] font-medium !block z-10 text-2xl hover:!bg-transparent"
                    className={`text-white gap-2 font-medium !block z-10 text-2xl hover:!bg-transparent`}
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
          {/** Select Ornaments Step */}
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
                      disabled={!!messages?.find((msg: any) => msg.ornamentId === 0)}
                      onClick={() => {
                        setOrnamentId(0);
                      }}
                      className={`ornaments-gradient flex justify-center items-center rounded-[30px] hover:!bg-transparent ${ornamentId === 0 && "bg-gradient-to-r from-[#ff7878] to-[#f7e96c]"} ${
                        !!messages?.find((msg: any) => msg.ornamentId === 0) && "grayscale"
                      }`}
                    >
                      <Image src="/box.png" alt="ornaments:box" height={120} width={120} />
                    </Button>
                  </div>
                  <div className="flex justify-center items-center">
                    <Button
                      isIconOnly
                      variant="light"
                      size="lg"
                      disabled={!!messages?.find((msg: any) => msg.ornamentId === 1)}
                      onClick={() => {
                        setOrnamentId(1);
                      }}
                      className={`ornaments-gradient flex justify-center items-center rounded-[30px] hover:!bg-transparent ${ornamentId === 1 && "bg-gradient-to-r from-[#ff7878] to-[#f7e96c]"} ${
                        !!messages?.find((msg: any) => msg.ornamentId === 1) && "grayscale"
                      }`}
                    >
                      <Image src="/cookie.png" alt="ornaments:cookie" height={120} width={120} />
                    </Button>
                  </div>
                  <div className="flex justify-center items-center">
                    <Button
                      isIconOnly
                      variant="light"
                      size="lg"
                      disabled={!!messages?.find((msg: any) => msg.ornamentId === 2)}
                      onClick={() => {
                        setOrnamentId(2);
                      }}
                      className={`ornaments-gradient flex justify-center items-center rounded-[30px] hover:!bg-transparent ${ornamentId === 2 && "bg-gradient-to-r from-[#ff7878] to-[#f7e96c]"} ${
                        !!messages?.find((msg: any) => msg.ornamentId === 2) && "grayscale"
                      }`}
                    >
                      <Image src="/snowman.png" alt="ornaments:snowman" height={120} width={120} />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-12 w-full justify-center">
                  <div className="flex justify-center items-center">
                    <Button
                      isIconOnly
                      variant="light"
                      size="lg"
                      disabled={!!messages?.find((msg: any) => msg.ornamentId === 3)}
                      onClick={() => {
                        setOrnamentId(3);
                      }}
                      className={`ornaments-gradient flex justify-center items-center rounded-[30px] hover:!bg-transparent ${ornamentId === 3 && "bg-gradient-to-r from-[#ff7878] to-[#f7e96c]"} ${
                        !!messages?.find((msg: any) => msg.ornamentId === 3) && "grayscale"
                      }`}
                    >
                      <Image src="/stick.png" alt="ornaments:stick" height={120} width={120} />
                    </Button>
                  </div>
                  <div className="flex justify-center items-center">
                    <Button
                      isIconOnly
                      variant="light"
                      size="lg"
                      disabled={!!messages?.find((msg: any) => msg.ornamentId === 4)}
                      onClick={() => {
                        setOrnamentId(4);
                      }}
                      className={`ornaments-gradient flex justify-center items-center rounded-[30px] hover:!bg-transparent ${ornamentId === 4 && "bg-gradient-to-r from-[#ff7878] to-[#f7e96c]"} ${
                        !!messages?.find((msg: any) => msg.ornamentId === 4) && "grayscale"
                      }`}
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
          {/** Message Input Step */}
          {steps === 2 && (
            <div className="h-dvh w-full flex flex-col items-center justify-center gap-8 animate-fadeIn">
              <div className="text-white w-full text-4xl flex justify-center items-center gap-4 mb-12">
                <span>Send Your Friend a Secret Christmas Letter</span>
              </div>
              <div className="w-[750px] h-[450px] bg-[url('/letter-background.png')] bg-cover bg-center bg-no-repeat rounded-[30px] p-12 flex flex-col justify-start items-center gap-4">
                <Input
                  value={nickname}
                  placeholder="Nickname"
                  className="!bg-transparent uppercase"
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
                <div className={isLoading || addMsgLoading ? "button-gradient-disabled" : "button-gradient"}>
                  <Button
                    variant="light"
                    className={`text-white gap-2 font-medium !block z-10 text-2xl hover:!bg-transparent`}
                    disabled={isLoading || addMsgLoading}
                    disableRipple
                    radius="full"
                    size="lg"
                    onClick={() => {
                      if (nickname.length > 0 && message.length > 0) {
                        addMsgHandler();
                      } else {
                        toast("Please fill in all the fields 🧐");
                      }
                    }}
                  >
                    {isLoading || addMsgLoading ? "Please wait for processing" : "Next"}
                  </Button>
                </div>
              </div>
            </div>
          )}
          {/** Result */}
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
        </>
      )}
    </main>
  );
}
