const pStartAddr = DebugSymbol.fromName("fuzz_one_input").address;

const MODULE_WHITELIST = [
  "fuzz",
  "libfuzzme.so",
];

new ModuleMap().values().forEach(m => {
  if (!MODULE_WHITELIST.includes(m.name)) {
    Afl.addExcludedRange(m.base, m.size);
  }
});

const cm = new CModule(`
  #include <string.h>
  #include <gum/gumdefs.h>

  #define BUF_LEN 1024

  void afl_persistent_hook(GumCpuContext *regs, uint8_t *input_buf,
                           uint32_t input_buf_len) {
    uint32_t length = (input_buf_len > BUF_LEN) ? BUF_LEN : input_buf_len;
    memcpy((void *)regs->x[0], input_buf, length);
    regs->x[1] = length;
  }
`, {
  memcpy: Module.getExportByName(null, "memcpy")
});

Afl.setEntryPoint(pStartAddr);
Afl.setPersistentAddress(pStartAddr);
Afl.setPersistentHook(cm.afl_persistent_hook);
Afl.setPersistentCount(10000);
Afl.setInstrumentLibraries();
Afl.done();
