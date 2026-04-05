/// <reference types="@webgpu/types" />

import DeviceControls from "../../classes/main/device";

type CLASS_KEYS<T> = {
  [K in keyof T]:
    T[K] extends abstract new (...args: any) => any ? K : never
}[keyof T];

/**
 * Resolves a `DeviceControls` constructor key to the corresponding instance type.
 */
type DC_MEMBER<K extends CLASS_KEYS<DeviceControls>> =
  DeviceControls[K] extends abstract new (...args: any) => infer R ? R : never;

export default DC_MEMBER;
