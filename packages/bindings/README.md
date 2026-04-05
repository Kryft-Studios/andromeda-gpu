# @agpu/bindings

**@agpu/bindings** is a set of classes that is made to wrap WebGPU but with modularity and ease of use.

# Installation

```js
import {WebGPUControls} from "@agpu/bindings"

const webgpu = new WebGPUControls(document.getElementById("canvas"))
const adapter = new webgpu.Adapter()
const context = new webgpu.Context()
const device = new adapter.Device()
```