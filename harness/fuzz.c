#include <errno.h>
#include <stdint.h>
#include <stdio.h>

#define BUFFER_SIZE 1024

extern void fuzzMe(const uint8_t *buffer, uint64_t length);

void fuzz_one_input(const uint8_t *buf, int len) { fuzzMe(buf, (uint64_t)len); }

int main(void) {
  uint8_t buffer[BUFFER_SIZE];

  ssize_t rlength = fread((void *)buffer, 1, BUFFER_SIZE, stdin);
  if (rlength == -1) {
    return errno;
  }

  fuzz_one_input(buffer, (int)rlength);
  return 0;
}
