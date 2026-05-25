/**
 * Phone Specifications Type Definitions
 */

export interface CameraLens {
  type: string;
  pixels: string;
  aperture: string;
  focalLength: string;
}

export interface CameraSensor {
  size: string;
  pixels: string;
  autofocus: string;
  stabilizer: string;
}

export interface CameraSpec {
  wide?: { lens: CameraLens; sensor: CameraSensor };
  telephoto?: { lens: CameraLens; sensor: CameraSensor };
  ultrawide?: { lens: CameraLens; sensor: CameraSensor };
}

export interface VideoRecording {
  resolution: string[];
  fps: string[];
  stabilizer: string[];
}

export interface DisplaySpec {
  type: string;
  features: string[];
  brightness: string[];
  resolution: string;
  protection: string[];
}

export interface ProcessorCPU {
  cores: string;
  frequency: string;
}

export interface ProcessorGPU {
  cores: string[];
  type: string[];
}

export interface Chipset {
  name: string;
  size: string;
  cpu: ProcessorCPU;
  gpu: ProcessorGPU;
}

export interface PhoneVariant {
  storage: string[];
  color: string[];
  ram?: string[];
}

export interface PhoneSpecifications {
  connectivity: {
    network: { support: string[]; wifi: string[]; bluetooth: string[] };
    sim: string[];
  };
  body: {
    thickness: string;
    dimensions: string;
    weight: string;
    protection: string[];
    waterResistance: string;
    features: string[];
  };
  screen: {
    size: string;
    ratio: string;
    display: DisplaySpec;
  };
  processor: {
    chipset: Chipset;
  };
  software: {
    os: string;
    updateVersion: string;
  };
  memory: {
    cardSlot: string;
    internal: string[];
    type: string;
  };
  camera: {
    main: CameraSpec;
    selfie: CameraSpec;
    mainVideo: VideoRecording;
    selfieVideo: VideoRecording;
    features: string[];
  };
  sound: {
    loudspeaker: string;
    jack35mm: string;
    stereo: boolean;
  };
  connectivity2: {
    wlan: string;
    bluetooth: string;
    nfc: string;
    gps: string;
    usb: string;
  };
  features: {
    sensors: string[];
    other: string[];
  };
  battery: {
    type: string;
    capacity: string;
    charging: {
      wired: string;
      wireless: string[];
    };
    enduranceRating: number;
  };
  misc: {
    colors: string[];
    models: string[];
    sarEU: string;
    price: string;
  };
  tests: {
    performance: string[];
    display: string;
    camera: string;
    loudspeaker: string;
    battery: string;
  };
}

export interface PhoneProductSpec {
  brand: string;
  model: string;
  slug: string;
  thumbnail: string;
  productImages: string[];
  announced: string;
  operatingSystem: string;
  variants: PhoneVariant;
  specifications: PhoneSpecifications;
  reviews?: string[];
  articles?: string[];
  relatedProducts?: string[];
}
