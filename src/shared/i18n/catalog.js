// Every feature's messages, registered once, before anything reads them
import { registerMessages } from "./index";
import shared from "@/shared/messages";
import typing from "@/features/typing-test/messages";
import history from "@/features/history/messages";

registerMessages("shared", shared);
registerMessages("typing", typing);
registerMessages("history", history);
