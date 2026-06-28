import { createContext } from "react";

export const GameContext = createContext<'paused' | 'running'>("paused");