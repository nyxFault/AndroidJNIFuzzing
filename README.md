# AndroidJNIFuzzing

![License](https://img.shields.io/github/license/nyxFault/AndroidJNIFuzzing?style=for-the-badge)
![AFL++](https://img.shields.io/badge/AFL++-4.06c-orange?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Android%20arm64-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![Mode](https://img.shields.io/badge/Fuzzing-Frida%20Persistent-blue?style=for-the-badge)
[![Target App](https://img.shields.io/badge/Target-FuzzMeApp-6f42c1?style=for-the-badge)](https://github.com/nyxFault/FuzzMeApp)
![Stars](https://img.shields.io/github/stars/nyxFault/AndroidJNIFuzzing?style=for-the-badge)
![Forks](https://img.shields.io/github/forks/nyxFault/AndroidJNIFuzzing?style=for-the-badge)

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

For this demo, I used [`FuzzMeApp`](https://github.com/nyxFault/FuzzMeApp) as the target app.

Example using released `FuzzMeApp` debug APK:

```bash
wget -O app-debug.apk https://github.com/nyxFault/FuzzMeApp/releases/download/v1.0.0/app-debug.apk
apktool d app-debug.apk -o fuzzmeapp_apk_out
mkdir -p harness/lib
cp fuzzmeapp_apk_out/lib/arm64-v8a/libfuzzme.so harness/lib/
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

