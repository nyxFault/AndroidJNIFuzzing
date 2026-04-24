# AndroidJNIFuzzing

Reusable harness pack to reproduce Android JNI fuzzing with AFL++ Frida mode on a rooted device.

This repo contains:

- a native harness (`fuzz.c`)
- Frida persistent config (`afl.js`)
- Android CMake file for harness build
- step-by-step workflow to run campaigns and triage crashes
- AFL++ pinned as a submodule (v4.06c-compatible workflow)

## Repository layout

```text
AndroidJNIFuzzing/
├── harness/
│   ├── afl.js
│   ├── CMakeLists.txt
│   └── fuzz.c
├── docs/
│   └── workflow.md
├── AFLplusplus/                 # git submodule
└── README.md
```

## Quick start

### 1) Clone with submodules

```bash
git clone --recurse-submodules https://github.com/nyxFault/AndroidJNIFuzzing.git
cd AndroidJNIFuzzing
```

If already cloned:

```bash
git submodule update --init --recursive
```

### 2) Put your target JNI library in harness/lib

Expected exported function:

```c
void fuzzMe(const uint8_t *buffer, uint64_t length);
```

Copy:

```bash
mkdir -p harness/lib
cp /path/to/libfuzzme.so harness/lib/
```

### 3) Build harness for Android arm64

```bash
cmake -S harness -B harness/build \
  -DANDROID_PLATFORM=31 \
  -DCMAKE_TOOLCHAIN_FILE=/path/to/android-ndk-r25c/build/cmake/android.toolchain.cmake \
  -DANDROID_ABI=arm64-v8a

cmake --build harness/build -j4
```

### 4) Build AFL++ binaries (one-time)

Use the pinned `AFLplusplus` submodule and build `afl-fuzz` + `afl-frida-trace.so` for Android.

### 5) Push to rooted device

Push:

- `afl-fuzz`
- `afl-frida-trace.so`
- `harness/build/fuzz`
- `harness/afl.js`
- `harness/lib/libfuzzme.so`

to `/data/local/tmp`.

### 6) Run campaign

```bash
AFL_FRIDA_INST_NO_OPTIMIZE=1 \
AFL_FRIDA_INST_NO_PREFETCH=1 \
AFL_FRIDA_INST_NO_PREFETCH_BACKPATCH=1 \
./afl-fuzz -O -G 1024 -i in -o out ./fuzz
```

## Notes

- Keep corpus tiny to start (1-3 seeds is fine).
- For modern devices, conservative Frida flags improve stability.
- Use `xxd out/default/crashes/id:*` to inspect crash inputs quickly.

