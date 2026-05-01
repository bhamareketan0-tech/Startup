import { Router, type IRouter } from "express";
import healthRouter from "./health";
import questionsRouter from "./questions";
import attemptsRouter from "./attempts";
import discussionsRouter from "./discussions";
import usersRouter from "./users";
import statsRouter from "./stats";
import authLocalRouter from "./authLocal";
import passagesRouter from "./passages";
import pdfExtractRouter from "./pdfExtract";
import chaptersRouter from "./chapters";
import appSettingsRouter from "./appSettings";

const router: IRouter = Router();

router.use(authLocalRouter);
router.use(healthRouter);
router.use(questionsRouter);
router.use(attemptsRouter);
router.use(discussionsRouter);
router.use(usersRouter);
router.use(statsRouter);
router.use(passagesRouter);
router.use(pdfExtractRouter);
router.use(chaptersRouter);
router.use(appSettingsRouter);

export default router;
