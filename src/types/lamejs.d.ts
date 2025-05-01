// src/types/lamejs.d.ts
declare module 'lamejs' {
    export class Mp3Encoder {
      constructor(channels: number, sampleRate: number, kbps: number);
      encodeBuffer(buffer: Int16Array): Int8Array;
      flush(): Int8Array;
    }
  
    // Add other necessary types
    export const Version: string;
    export const Layer: number;
    export const Mode: {
      STEREO: number;
      JOINT_STEREO: number;
      DUAL_CHANNEL: number;
      MONO: number;
    };
  }