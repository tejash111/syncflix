import { MutableRefObject } from "react";

// Socket event handler refs - these allow components to register handlers
// that will be called when socket events are received
export const onPlayRef: MutableRefObject<((data: { currentTime: number }) => void) | null> = { current: null };
export const onPauseRef: MutableRefObject<((data: { currentTime: number }) => void) | null> = { current: null };
export const onSeekRef: MutableRefObject<((data: { currentTime: number }) => void) | null> = { current: null };
export const onSyncRequestRef: MutableRefObject<(() => void) | null> = { current: null };
export const onSyncResponseRef: MutableRefObject<((data: { isPlaying: boolean; currentTime: number }) => void) | null> = { current: null };
