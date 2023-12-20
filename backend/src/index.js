import { app, langRouter, db } from "./global.js";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";

langRouter.use("/auth", authRouter);
langRouter.use("/user", userRouter);

app.get("/", (req, res) => {
    res.send("Area API");
});

app.listen(process.env.API_PORT, process.env.API_HOST_NAME, () => {
    console.log(`App listening to http://${process.env.API_HOST_NAME}:${process.env.API_PORT}`);
});
