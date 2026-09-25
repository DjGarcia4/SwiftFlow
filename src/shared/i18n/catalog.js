// Every feature's messages, registered once, before anything reads them
import { registerMessages } from "./index";
import shared from "@/shared/messages";
import typing from "@/features/typing-test/messages";
import history from "@/features/history/messages";
import course from "@/features/course/messages";
import landing from "@/features/landing/messages";

registerMessages("shared", shared);
registerMessages("typing", typing);
registerMessages("history", history);
registerMessages("course", course);
registerMessages("landing", landing);
