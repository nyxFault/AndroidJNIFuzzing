project(FuzzMeAppHarness)
cmake_minimum_required(VERSION 3.8)

link_directories(${CMAKE_SOURCE_DIR}/lib)

add_executable(fuzz "fuzz.c")
set_property(TARGET fuzz APPEND_STRING PROPERTY LINK_FLAGS " -Wl,-rpath=$ORIGIN")
target_link_libraries(fuzz fuzzme)
