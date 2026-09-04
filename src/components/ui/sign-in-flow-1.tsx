import {
  Canvas,
  useFrame,
  useThree,
} from "@react-three/fiber";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import * as THREE from "three";

type Uniforms = {
  [key: string]: {
    value:
      | number
      | number[]
      | number[][];
    type: string;
  };
};

type ShaderProps = {
  source: string;

  uniforms: {
    [key: string]: {
      value:
        | number
        | number[]
        | number[][];
      type: string;
    };
  };

  maxFps?: number;
};

type SignInFlowProps = {
  email: string;
  password: string;
  loading?: boolean;

  onEmailChange: (
    value: string,
  ) => void;

  onPasswordChange: (
    value: string,
  ) => void;

  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
};

function cn(
  ...classes: Array<
    string | false | null | undefined
  >
) {
  return classes
    .filter(Boolean)
    .join(" ");
}

function ShaderMaterial({
  source,
  uniforms,
  maxFps = 45,
}: {
  source: string;
  uniforms: Uniforms;
  maxFps?: number;
}) {
  const { size } = useThree();

  const meshRef =
    useRef<THREE.Mesh>(null);

  const lastFrameRef =
    useRef(0);

  const preparedUniforms =
    useMemo(() => {
      const output: Record<
        string,
        {
          value:
            | number
            | THREE.Vector2
            | THREE.Vector3
            | THREE.Vector3[]
            | number[];
        }
      > = {};

      for (const uniformName in uniforms) {
        const uniform =
          uniforms[uniformName];

        switch (uniform.type) {
          case "uniform1f":
          case "uniform1i":
          case "uniform1fv":
            output[uniformName] = {
              value:
                uniform.value as
                  | number
                  | number[],
            };
            break;

          case "uniform3fv":
            output[uniformName] = {
              value: (
                uniform.value as number[][]
              ).map(
                (value) =>
                  new THREE.Vector3().fromArray(
                    value,
                  ),
              ),
            };
            break;

          case "uniform2f":
            output[uniformName] = {
              value:
                new THREE.Vector2().fromArray(
                  uniform.value as number[],
                ),
            };
            break;

          case "uniform3f":
            output[uniformName] = {
              value:
                new THREE.Vector3().fromArray(
                  uniform.value as number[],
                ),
            };
            break;

          default:
            break;
        }
      }

      output.u_time = {
        value: 0,
      };

      output.u_resolution = {
        value: new THREE.Vector2(
          size.width * 2,
          size.height * 2,
        ),
      };

      return output;
    }, [
      uniforms,
      size.width,
      size.height,
    ]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `
          precision mediump float;

          in vec2 coordinates;

          uniform vec2 u_resolution;

          out vec2 fragCoord;

          void main() {
            gl_Position = vec4(
              position.x,
              position.y,
              0.0,
              1.0
            );

            fragCoord =
              (position.xy + vec2(1.0))
              * 0.5
              * u_resolution;

            fragCoord.y =
              u_resolution.y
              - fragCoord.y;
          }
        `,

        fragmentShader: source,

        uniforms:
          preparedUniforms as THREE.ShaderMaterialParameters["uniforms"],

        glslVersion:
          THREE.GLSL3,

        transparent: true,

        blending:
          THREE.AdditiveBlending,

        depthWrite: false,
      }),
    [
      preparedUniforms,
      source,
    ],
  );

  useFrame(({ clock }) => {
    const now =
      clock.getElapsedTime();

    const minFrameTime =
      1 / maxFps;

    if (
      now -
        lastFrameRef.current <
      minFrameTime
    ) {
      return;
    }

    lastFrameRef.current = now;

    if (
      material.uniforms.u_time
    ) {
      material.uniforms.u_time.value =
        now;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />

      <primitive
        object={material}
        attach="material"
      />
    </mesh>
  );
}

function Shader({
  source,
  uniforms,
  maxFps = 45,
}: ShaderProps) {
  return (
    <Canvas
      className="absolute inset-0 h-full w-full"
      dpr={[1, 1.5]}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference:
          "high-performance",
      }}
    >
      <ShaderMaterial
        source={source}
        uniforms={uniforms}
        maxFps={maxFps}
      />
    </Canvas>
  );
}

function DotMatrix({
  colors = [
    [53, 220, 230],
    [110, 92, 255],
    [75, 150, 255],
  ],

  opacities = [
    0.15,
    0.2,
    0.25,
    0.3,
    0.35,
    0.4,
    0.55,
    0.65,
    0.75,
    0.9,
  ],

  totalSize = 24,
  dotSize = 3,
}: {
  colors?: number[][];
  opacities?: number[];
  totalSize?: number;
  dotSize?: number;
}) {
  const uniforms =
    useMemo(() => {
      let colorsArray = [
        colors[0],
        colors[0],
        colors[0],
        colors[0],
        colors[0],
        colors[0],
      ];

      if (
        colors.length === 2
      ) {
        colorsArray = [
          colors[0],
          colors[0],
          colors[0],
          colors[1],
          colors[1],
          colors[1],
        ];
      }

      if (
        colors.length >= 3
      ) {
        colorsArray = [
          colors[0],
          colors[0],
          colors[1],
          colors[1],
          colors[2],
          colors[2],
        ];
      }

      return {
        u_colors: {
          value:
            colorsArray.map(
              (color) => [
                color[0] /
                  255,
                color[1] /
                  255,
                color[2] /
                  255,
              ],
            ),
          type: "uniform3fv",
        },

        u_opacities: {
          value: opacities,
          type: "uniform1fv",
        },

        u_total_size: {
          value: totalSize,
          type: "uniform1f",
        },

        u_dot_size: {
          value: dotSize,
          type: "uniform1f",
        },
      };
    }, [
      colors,
      opacities,
      totalSize,
      dotSize,
    ]);

  return (
    <Shader
      maxFps={45}
      uniforms={uniforms}
      source={`
        precision mediump float;

        in vec2 fragCoord;

        uniform float u_time;
        uniform float u_opacities[10];
        uniform vec3 u_colors[6];
        uniform float u_total_size;
        uniform float u_dot_size;
        uniform vec2 u_resolution;

        out vec4 fragColor;

        float PHI =
          1.61803398874989484820459;

        float random(vec2 xy) {
          return fract(
            tan(
              distance(
                xy * PHI,
                xy
              ) * 0.5
            ) * xy.x
          );
        }

        void main() {
          vec2 st =
            fragCoord.xy;

          st.x -= abs(
            floor(
              (
                mod(
                  u_resolution.x,
                  u_total_size
                )
                -
                u_dot_size
              ) * 0.5
            )
          );

          st.y -= abs(
            floor(
              (
                mod(
                  u_resolution.y,
                  u_total_size
                )
                -
                u_dot_size
              ) * 0.5
            )
          );

          float opacity =
            step(
              0.0,
              st.x
            );

          opacity *=
            step(
              0.0,
              st.y
            );

          vec2 st2 =
            vec2(
              int(
                st.x /
                u_total_size
              ),
              int(
                st.y /
                u_total_size
              )
            );

          float frequency =
            4.0;

          float showOffset =
            random(st2);

          float rand =
            random(
              st2 *
              floor(
                (
                  u_time /
                  frequency
                )
                +
                showOffset
                +
                frequency
              )
            );

          opacity *=
            u_opacities[
              int(
                rand * 10.0
              )
            ];

          opacity *=
            1.0
            -
            step(
              u_dot_size /
              u_total_size,

              fract(
                st.x /
                u_total_size
              )
            );

          opacity *=
            1.0
            -
            step(
              u_dot_size /
              u_total_size,

              fract(
                st.y /
                u_total_size
              )
            );

          vec2 centerGrid =
            u_resolution
            /
            2.0
            /
            u_total_size;

          float distanceFromCenter =
            distance(
              centerGrid,
              st2
            );

          float timingOffset =
            distanceFromCenter
            * 0.012
            +
            random(st2)
            * 0.15;

          opacity *=
            smoothstep(
              timingOffset,
              timingOffset + 0.6,
              u_time * 0.42
            );

          float pulse =
            0.82
            +
            sin(
              u_time * 1.2
              +
              showOffset
              * 8.0
            )
            *
            0.18;

          opacity *= pulse;

          vec3 color =
            u_colors[
              int(
                showOffset
                * 6.0
              )
            ];

          fragColor =
            vec4(
              color,
              opacity
            );
        }
      `}
    />
  );
}

function CanvasRevealEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#03080d]">
      <DotMatrix />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,8,13,.1)_28%,rgba(3,8,13,.75)_72%,#03080d_100%)]" />

      <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[#03080d] to-transparent" />

      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#03080d] to-transparent" />

      <div className="absolute -left-40 top-1/3 size-[420px] rounded-full bg-cyan-400/[0.08] blur-[130px]" />

      <div className="absolute -right-40 top-1/4 size-[420px] rounded-full bg-violet-500/[0.08] blur-[140px]" />
    </div>
  );
}

export function SignInFlow({
  email,
  password,
  loading = false,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: SignInFlowProps) {
  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03080d] text-white">
      <CanvasRevealEffect />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)",

          backgroundSize:
            "52px 52px",
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key="login"
            initial={{
              opacity: 0,
              y: 24,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.55,
              ease: "easeOut",
            }}
            className="w-full max-w-[430px]"
          >
            {/* BRAND */}
            <div className="mb-7 text-center">
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.85,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.12,
                }}
                className="mx-auto flex size-20 items-center justify-center rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-2.5 shadow-2xl shadow-black/20 backdrop-blur-xl"
              >
                <img
                  src="/logo.png"
                  alt="Nova Web Studio"
                  className="max-h-full max-w-full object-contain"
                />
              </motion.div>

              <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[.24em] text-cyan-300/80">
                <Sparkles className="size-3.5" />

                Área reservada
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-[2.15rem]">
                Nova Web CRM
              </h1>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/45">
                Acesso reservado à equipa da Nova Web Studio.
              </p>
            </div>

            {/* CARD */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-7">
              <div className="absolute -right-20 -top-20 size-56 rounded-full bg-cyan-400/[0.08] blur-3xl" />

              <div className="absolute -bottom-24 -left-20 size-64 rounded-full bg-violet-500/[0.07] blur-3xl" />

              <div className="relative">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl border border-cyan-300/10 bg-cyan-300/[0.06] text-cyan-300">
                    <ShieldCheck className="size-4" />
                  </span>

                  <div>
                    <p className="text-sm font-medium">
                      Entrar no painel
                    </p>

                    <p className="mt-0.5 text-[11px] text-white/35">
                      Utilize as credenciais da sua conta.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={onSubmit}
                  className="mt-7 space-y-4"
                >
                  {/* EMAIL */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-[11px] font-medium text-white/45">
                      <Mail className="size-3.5 text-cyan-300/80" />

                      Email
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(event) =>
                        onEmailChange(
                          event.target
                            .value,
                        )
                      }
                      autoComplete="email"
                      required
                      placeholder="email@novawebstudio.pt"
                      className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-[13px] text-white outline-none transition placeholder:text-white/20 hover:border-white/15 focus:border-cyan-300/35 focus:bg-black/30 focus:ring-4 focus:ring-cyan-300/[0.05]"
                    />
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-[11px] font-medium text-white/45">
                      <LockKeyhole className="size-3.5 text-cyan-300/80" />

                      Palavra-passe
                    </label>

                    <div className="relative">
                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={password}
                        onChange={(
                          event,
                        ) =>
                          onPasswordChange(
                            event
                              .target
                              .value,
                          )
                        }
                        autoComplete="current-password"
                        minLength={6}
                        required
                        className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 pr-12 text-[13px] text-white outline-none transition placeholder:text-white/20 hover:border-white/15 focus:border-cyan-300/35 focus:bg-black/30 focus:ring-4 focus:ring-cyan-300/[0.05]"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (current) =>
                              !current,
                          )
                        }
                        aria-label={
                          showPassword
                            ? "Ocultar palavra-passe"
                            : "Mostrar palavra-passe"
                        }
                        className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-white/35 transition hover:bg-white/[0.05] hover:text-white/70"
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={cn(
                      "group relative mt-2 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl font-medium transition duration-300",

                      "bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-400 text-[#031015]",

                      "shadow-lg shadow-cyan-300/10 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-300/20",

                      loading &&
                        "pointer-events-none opacity-60",
                    )}
                  >
                    <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-[120%]" />

                    {loading ? (
                      <>
                        <span className="relative size-4 animate-spin rounded-full border-2 border-[#031015]/25 border-t-[#031015]" />

                        <span className="relative">
                          A entrar…
                        </span>
                      </>
                    ) : (
                      <>
                        <LogIn className="relative size-4" />

                        <span className="relative">
                          Entrar no painel
                        </span>

                        <span className="relative transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-white/25">
                  <ShieldCheck className="size-3.5" />

                  Acesso protegido
                </div>
              </div>
            </div>

            <p className="mt-5 text-center text-[10px] uppercase tracking-[.15em] text-white/20">
              Nova Web Studio · CRM interno
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
