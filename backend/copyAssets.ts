import path from "path";
import cpx from "cpx";

cpx.copySync(path.join(__dirname, "client", "build/**"), path.join(__dirname, "dist", "build"));
cpx.copySync(path.join(__dirname, "package*.json"), path.join(__dirname, "dist"));
