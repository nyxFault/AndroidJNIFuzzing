# Android JNI Fuzzing Workflow (AFL++ Frida)

This is the exact reusable flow used for JNI native target fuzzing.

## 1. Target selection

- Identify exported JNI/native target in your app (`lib*.so`)
- Prefer function that accepts raw bytes and length
- If needed, create a lightweight harness function (`fuzz_one_input`)

## 2. Harness build

From repo root:

```bash
mkdir -p harness/lib harness/build
cp /path/to/libfuzzme.so harness/lib/
cmake -S harness -B harness/build \
  -DANDROID_PLATFORM=31 \
  -DCMAKE_TOOLCHAIN_FILE=/path/to/android-ndk-r25c/build/cmake/android.toolchain.cmake \
  -DANDROID_ABI=arm64-v8a
cmake --build harness/build -j4
```

## 3. Device prep

- Rooted device required
- Push binaries to `/data/local/tmp`
- Set CPU governor to performance (recommended for AFL stability)

## 4. AFL++ Frida run

```bash
AFL_FRIDA_INST_NO_OPTIMIZE=1 \
AFL_FRIDA_INST_NO_PREFETCH=1 \
AFL_FRIDA_INST_NO_PREFETCH_BACKPATCH=1 \
./afl-fuzz -O -G 1024 -i in -o out ./fuzz
```

## 5. Crash triage

```bash
xxd out/default/crashes/id:*
```

Then replay crashing inputs directly against harness/native target.

