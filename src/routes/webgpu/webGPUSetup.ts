// Silenced below rule due to missing WebGPU types
/* eslint-disable @typescript-eslint/no-explicit-any */

const checkSupport = () => {
    if (!navigator.gpu) {
        throw new Error("WebGPU not supported on this browser.");
    }
    return true;
}

const getAdapter = async () => {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error("No appropriate GPUAdapter found.");
    }
    return adapter;
}

const getDevice = async (adapter: any) => {
    const device = await adapter.requestDevice();
    if (!device) {
        throw new Error("No appropriate GPUdevice found.");
    }
    return device;
}

const getContext = (canvas: HTMLCanvasElement, device: any) => {
    try {
        const context = canvas.getContext("webgpu");
        const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
        context.configure({
            device: device,
            format: canvasFormat,
        });
        return context;
    } catch (error) {
        console.error(error);
    }
}

const getEncoder = (device: any) => {
    const encoder = device.createCommandEncoder();
    if (!encoder) throw new Error("Failure to create encoder");
    return encoder;
}

export const setup = async (canvas: HTMLCanvasElement) => {
    const supported = checkSupport();
    /** "WebGPU's representation of a specific piece of GPU hardware in your device" */
    const adapter = await getAdapter();
    /** "The main interface through which most interaction with the GPU happens" */
    const device = await getDevice(adapter);
    const context = getContext(canvas, device);
    /** Web GPU command encoder. Used to trigger render passes and send info to the GPU */
    const encoder = getEncoder(device);

    return {
        supported, adapter, device, context, encoder
    }
}