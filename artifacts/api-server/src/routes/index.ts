import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import membersRouter from "./members";
import groupsRouter from "./groups";
import messagesGroupRouter from "./messages";
import messagesRouter from "./messages_extra";
import applicationsRouter from "./applications";
import pollsRouter from "./polls";
import eventsRouter from "./events";
import galleryRouter from "./gallery";
import settingsRouter from "./settings";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/members", membersRouter);
router.use("/groups", groupsRouter);
router.use("/groups", messagesGroupRouter);
router.use("/messages", messagesRouter);
router.use("/applications", applicationsRouter);
router.use("/polls", pollsRouter);
router.use("/events", eventsRouter);
router.use("/gallery", galleryRouter);
router.use("/settings", settingsRouter);
router.use("/stats", statsRouter);
router.use("/audit-log", statsRouter);

export default router;
