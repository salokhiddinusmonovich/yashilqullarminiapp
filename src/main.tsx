import { render } from "preact";
import App from "./App";
import { initTelegram, applyTheme } from "./tg";
import "./styles.css";

initTelegram();
applyTheme();
render(<App />, document.getElementById("root")!);
