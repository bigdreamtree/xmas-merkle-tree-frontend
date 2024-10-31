import { MessageInputWrapper } from "../components/MessageInputWrapper";
import { MessageList } from "../components/MessageList";
import { Divider } from "@nextui-org/react";

export default function Home() {
  return (
    <main className="w-dvw flex flex-col justify-start items-center">
      <div className="w-full flex flex-col gap-8">
        <MessageInputWrapper />
        <Divider />
        <MessageList />
      </div>
    </main>
  );
}
