// test is generated with ai. 
import "./style.css";
import WebGPUControls from "../../../packages/bindings/dist/classes/main/webgpucontrols.js";
const app = document.querySelector("#app");
if (!app) {
    throw new Error("App root not found.");
}

app.innerHTML = `
<main class="layout">
  <section class="intro">
    <p class="eyebrow">Andromeda GPU Bindings</p>
    <h1>Spinning Cube</h1>
    <p class="lede">
      Plain JavaScript example using <code>WebGPUControls</code> and the bindings wrappers
      for buffers, pipelines, textures, command encoding, and render passes.
    </p>
    <dl class="stats">
      <div>
        <dt>Status</dt>
        <dd id="status">Booting renderer...</dd>
      </div>
      <div>
        <dt>Canvas Format</dt>
        <dd id="format">Pending</dd>
      </div>
    </dl>
  </section>
  <section class="viewer">
    <canvas id="gpu-canvas" aria-label="Spinning cube rendered with WebGPU"></canvas>
  </section>
</main>
`;

const canvas = document.querySelector("#gpu-canvas");
const status = document.querySelector("#status");
const formatLabel = document.querySelector("#format");

if (!canvas || !status || !formatLabel) {
    throw new Error("Demo UI failed to initialize.");
}

const setStatus = (message) => {
    status.textContent = message;
    console.log(message)
};
setStatus("Defining vertices and indices")
const cubeVertices = new Float32Array([
    -1, -1, 1, 1, 0.25, 0.2,
    1, -1, 1, 1, 0.7, 0.2,
    1, 1, 1, 1, 0.95, 0.55,
    -1, 1, 1, 0.95, 0.3, 0.25,
    -1, -1, -1, 0.2, 0.45, 1,
    1, -1, -1, 0.2, 0.8, 1,
    1, 1, -1, 0.6, 0.95, 1,
    -1, 1, -1, 0.25, 0.65, 1,
]);

const cubeIndices = new Uint16Array([
    0, 1, 2, 2, 3, 0,
    1, 5, 6, 6, 2, 1,
    5, 4, 7, 7, 6, 5,
    4, 0, 3, 3, 7, 4,
    3, 2, 6, 6, 7, 3,
    4, 5, 1, 1, 0, 4,
]);

setStatus("Defining shader")
const shaderCode = /* wgsl */ `
struct Uniforms {
  mvp : mat4x4<f32>,
}

@group(0) @binding(0)
var<uniform> uniforms : Uniforms;

struct VertexInput {
  @location(0) position : vec3<f32>,
  @location(1) color : vec3<f32>,
}

struct VertexOutput {
  @builtin(position) position : vec4<f32>,
  @location(0) color : vec3<f32>,
}

@vertex
fn vsMain(input : VertexInput) -> VertexOutput {
  var output : VertexOutput;
  output.position = uniforms.mvp * vec4<f32>(input.position, 1.0);
  output.color = input.color;
  return output;
}

@fragment
fn fsMain(input : VertexOutput) -> @location(0) vec4<f32> {
  return vec4<f32>(input.color, 1.0);
}
`;

setStatus("Defining helpers")
const createIdentity = () => {
    const matrix = new Float32Array(16);
    matrix[0] = 1;
    matrix[5] = 1;
    matrix[10] = 1;
    matrix[15] = 1;
    return matrix;
};

const multiplyMatrices = (left, right) => {
    const out = new Float32Array(16);

    for (let column = 0; column < 4; column += 1) {
        for (let row = 0; row < 4; row += 1) {
            let sum = 0;
            for (let index = 0; index < 4; index += 1) {
                sum += left[index * 4 + row] * right[column * 4 + index];
            }
            out[column * 4 + row] = sum;
        }
    }

    return out;
};

const createPerspective = (fieldOfView, aspect, near, far) => {
    const f = 1 / Math.tan(fieldOfView / 2);
    const matrix = new Float32Array(16);

    matrix[0] = f / aspect;
    matrix[5] = f;
    matrix[10] = far / (near - far);
    matrix[11] = -1;
    matrix[14] = (near * far) / (near - far);

    return matrix;
};

const createTranslation = (x, y, z) => {
    const matrix = createIdentity();
    matrix[12] = x;
    matrix[13] = y;
    matrix[14] = z;
    return matrix;
};

const createRotationX = (radians) => {
    const matrix = createIdentity();
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);

    matrix[5] = cosine;
    matrix[6] = sine;
    matrix[9] = -sine;
    matrix[10] = cosine;

    return matrix;
};

const createRotationY = (radians) => {
    const matrix = createIdentity();
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);

    matrix[0] = cosine;
    matrix[2] = -sine;
    matrix[8] = sine;
    matrix[10] = cosine;

    return matrix;
};

const resizeCanvasToDisplaySize = (target) => {
    const pixelRatio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(target.clientWidth * pixelRatio));
    const height = Math.max(1, Math.floor(target.clientHeight * pixelRatio));

    if (target.width !== width || target.height !== height) {
        target.width = width;
        target.height = height;
        return true;
    }

    return false;
};

const run = async () => {
    try {
        setStatus("Creating controls")
        const controls = new WebGPUControls(canvas);
        setStatus("Getting context")
        const context = controls.context();

        if (!context) {
            throw new Error("Unable to create a WebGPU canvas context.");
        }

        setStatus("Getting adapter")
        const adapter = await controls.Adapter;

        setStatus("Getting device")
        const deviceControls = await adapter.device({});
        const format = controls.preferredCanvasFormat();


        formatLabel.textContent = format;
        setStatus("Configuring context")
        context.configure({
            device: deviceControls,
            format,
            alphaMode: "opaque",
        });

        setStatus("Defining shader modules")
        const vertexShaderModule = new deviceControls.ShaderModule(shaderCode, {
            label: "cube-vertex-shader",
            entryPoint: "vsMain",
        });
        const fragmentShaderModule = new deviceControls.ShaderModule(shaderCode, {
            label: "cube-fragment-shader",
            entryPoint: "fsMain",
        });

        setStatus("defining buffers")

        const uniformBuffer = new deviceControls.Buffer({
            label: "cube-uniforms",
            value: new Float32Array(16),
            usage:{"buffer":{"uniform":true},"copy":true},
        });

        const vertexBuffer = new deviceControls.Buffer({
            label: "cube-vertices",
            value: cubeVertices,
            usage: {"buffer":{vertex:true},copy:true},
        });

        const indexBuffer = new deviceControls.Buffer({
            label: "cube-indices",
            value: cubeIndices,
            usage: {buffer:{"index":true},copy:true},
        });

        setStatus("Defining bind groups")
        const bindGroupLayout = new deviceControls.BindGroupLayout({
            label: "cube-bind-group-layout",
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: "uniform" },
                },
            ],
        });

        setStatus("Defining pipeline")
        const pipelineLayout = new deviceControls.PipelineLayout({
            label: "cube-pipeline-layout",
            bindGroupLayouts: [bindGroupLayout],
        });

        const pipeline = new deviceControls.RenderPipeline({
            label: "cube-pipeline",
            layout: pipelineLayout,
            vertex: {
                module: vertexShaderModule,
                buffers: [
                    {
                        arrayStride: 24,
                        attributes: [
                            { shaderLocation: 0, offset: 0, format: "float32x3" },
                            { shaderLocation: 1, offset: 12, format: "float32x3" },
                        ],
                    },
                ],
            },
            fragment: {
                module: fragmentShaderModule,
                targets: [{ format }],
            },
            primitive: {
                topology: "triangle-list",
                cullMode: "back",
            },
            multisample: {
                count: 1,
            },
            depthStencil: {
                format: "depth24plus",
                depth: {
                    write: true,
                    compare: "less",
                },
            },
        });
        setStatus("Initializing pipeline")
        await pipeline.init();

        setStatus("Creating bind group")
        const bindGroup = new deviceControls.BindGroup({
            label: "cube-bind-group",
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: uniformBuffer,
                },
            ],
        });
        setStatus("Creating depth texture")
        let depthTexture;

        const recreateDepthTexture = () => {
            if (depthTexture) {
                depthTexture.destroy();
            }
            depthTexture = new deviceControls.Texture({
                label: "cube-depth-texture",
                size: [canvas.width || 1, canvas.height || 1],
                format: "depth24plus",
                usage:{
                    "renderAttachment":true
                },
            });
        };

        resizeCanvasToDisplaySize(canvas);
        recreateDepthTexture();

        const drawFrame = async (time) => {
            const didResize = resizeCanvasToDisplaySize(canvas);
            if (didResize) {
                recreateDepthTexture();
            }

            const aspect = canvas.width / canvas.height;
            const projection = createPerspective((60 * Math.PI) / 180, aspect, 0.1, 100);
            const rotation = multiplyMatrices(
                createRotationY(time * 0.001),
                createRotationX(time * 0.0007),
            );
            const view = createTranslation(0, 0, -5);
            const viewProjection = multiplyMatrices(projection, view);
            const mvp = multiplyMatrices(viewProjection, rotation);

            uniformBuffer.value(mvp);
            uniformBuffer.sync();

            const encoder = new deviceControls.CommandEncoder("cube-command-encoder");
            const colorTexture = context.currentTexture(deviceControls);
            const renderPass = new encoder.RenderPass({
                label: "cube-render-pass",
                attachment: {
                    color: [
                        {
                            color: { r: 0.03, g: 0.05, b: 0.09, a: 1 },
                            operations: {
                                load: "clear",
                                store: "store",
                            },
                            texture: {
                                view: colorTexture.view(),
                            },
                        },
                    ],
                    depthStencil: {
                        view: depthTexture.view(),
                        depth: {
                            clear: 1,
                            operations: {
                                load: "clear",
                                store: "store",
                            },
                        },
                        stencil: undefined,
                    },
                },
            });

            await renderPass.pipeline(pipeline);
            renderPass.bindGroup(0, bindGroup);
            renderPass.buffer.vertex(0, vertexBuffer);
            renderPass.buffer.index(indexBuffer);
            renderPass.draw.indexed(cubeIndices.length);
            renderPass.end();

            deviceControls.queue.submit([
                encoder.finish({ label: "cube-command-buffer" }),
            ]);

            requestAnimationFrame(drawFrame);
        };

        setStatus("Rendering");
        requestAnimationFrame(drawFrame);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setStatus(`Failed: ${message}`);
        formatLabel.textContent = "Unavailable";
        console.error(error);
    }
};

void run();
