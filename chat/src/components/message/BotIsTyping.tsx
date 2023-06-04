import { ChatMessages } from "../../types/ChatTypes";
import { BotIsTypingMessage } from "./BotIsTypingMessage";
import { useChatBotQueryData } from "../../hooks/useChatBotQueryData";

type Props = {
  chatMessages: ChatMessages;
  onTextChange(partialBotResponse: string): void;
  onFinish(finalBotResponse: string): void;
  onError(errorText: string): void;
};

export function BotIsTyping({
  chatMessages,
  onFinish,
  onError,
  onTextChange,
}: Props): React.ReactElement | null {
  const chatBotQueryData = useChatBotQueryData();
  if (!chatBotQueryData) {
    return null;
  }

  return (
    <BotIsTypingMessage
      chatMessages={chatMessages}
      chatBotQueryData={chatBotQueryData}
      onFinish={onFinish}
      onError={onError}
      onTextChange={onTextChange}
    />
  );
}
