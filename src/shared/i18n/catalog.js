// Every feature's messages, registered once, before anything reads them
import { registerMessages } from "./index";
import shared from "@/shared/messages";
import typing from "@/features/typing-test/messages";

registerMessages("shared", shared);
registerMessages("typing", typing);
