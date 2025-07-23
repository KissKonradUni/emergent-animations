import { CanvasScene } from "./CanvasScene.ts";
import { CanvasWrapper, Time } from "./CanvasWrapper.ts";

export class CanvasGLScene extends CanvasScene {
    protected gl: WebGL2RenderingContext;
    
    constructor(wrapper: CanvasWrapper, context: CanvasRenderingContext2D, time: Readonly<Time>) {
        super(wrapper, context, time);
        
        const glContext = wrapper.getWebGLContext() as WebGL2RenderingContext;
        if (!glContext) {
            throw new Error("WebGL2 context is not available.");
        }

        this.gl = glContext;

        this.quad.vbo = this.gl.createBuffer();
        this.quad.ibo = this.gl.createBuffer();

        this.quad.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.quad.vao);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quad.vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.quad.vertices, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.quad.ibo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.quad.indices, this.gl.STATIC_DRAW);

        this.shaders.program = this.gl.createProgram();
        const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(vertexShader!, this.shaders.vertex);
        this.gl.compileShader(vertexShader!);
        if (!this.gl.getShaderParameter(vertexShader!, this.gl.COMPILE_STATUS)) {
            console.error("Vertex shader compilation failed:", this.gl.getShaderInfoLog(vertexShader!));
        }
        const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(fragmentShader!, this.shaders.fragment);
        this.gl.compileShader(fragmentShader!);
        if (!this.gl.getShaderParameter(fragmentShader!, this.gl.COMPILE_STATUS)) {
            console.error("Fragment shader compilation failed:", this.gl.getShaderInfoLog(fragmentShader!));
        }
        this.gl.attachShader(this.shaders.program!, vertexShader!);
        this.gl.attachShader(this.shaders.program!, fragmentShader!);
        this.gl.linkProgram(this.shaders.program!);
        if (!this.gl.getProgramParameter(this.shaders.program!, this.gl.LINK_STATUS)) {
            console.error("Shader program linking failed:", this.gl.getProgramInfoLog(this.shaders.program!));
        }
        this.gl.useProgram(this.shaders.program!);

        const location = this.gl.getAttribLocation(this.shaders.program!, 'a_position');
        this.gl.vertexAttribPointer(location, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(location);

        this.gl.bindVertexArray(null);

        this.gl.deleteShader(vertexShader!);
        this.gl.deleteShader(fragmentShader!);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    }

    quad = {
        vertices: new Float32Array([
            -1.0, -1.0, 0.0,
            -1.0,  1.0, 0.0,
             1.0, -1.0, 0.0,
             1.0,  1.0, 0.0,
        ]),
        indices: new Uint16Array([
            0, 1, 2, 3
        ]),

        vbo: null as WebGLBuffer | null,
        ibo: null as WebGLBuffer | null,
        vao: null as WebGLVertexArrayObject | null,
    }

    shaders = {
        vertex: 
           `#version 300 es
            in vec3 a_position;
            out vec2 v_uv;
            void main() {
                gl_Position = vec4(a_position, 1.0);
                v_uv = (a_position.xy + vec2(1.0, 1.0)) * 0.5;
            }
        `,
        fragment: 
           `#version 300 es
            precision mediump float;
            in vec2 v_uv;
            out vec4 outColor;
            
            void main() {
                vec2 uv = v_uv;
                vec2 tileUV = uv * vec2(160.0, 90.0);

                // Figure out the tile index based on the UV coordinates
                int tileX = int(floor(tileUV.x));
                int tileY = int(floor(tileUV.y));

                // Checkerboard
                if ((tileX + tileY) % 2 == 0) {
                    outColor = vec4(1.0, 1.0, 1.0, 1.0); // White tile
                } else {
                    outColor = vec4(0.0, 0.0, 0.0, 1.0); // Black tile
                }
            }
        `,
        program: null as WebGLProgram | null,
    };

    override render(): void {
        if (!this.gl) {
            console.error("WebGL context is not initialized.");
            return;
        }

        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.useProgram(this.shaders.program!);

        this.gl.bindVertexArray(this.quad.vao);
        this.gl.drawElements(this.gl.TRIANGLE_STRIP, this.quad.indices.length, this.gl.UNSIGNED_SHORT, 0);
        this.gl.bindVertexArray(null);
    }

}