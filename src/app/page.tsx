import { MessageInputWrapper } from "./components/MessageInputWrapper";
import { MessageList } from "./components/MessageList";

export default function Home() {
  return (
    <div className="">
      <main className="">
        <MessageInputWrapper />
        <MessageList />
      </main>
    </div>
  );
}
