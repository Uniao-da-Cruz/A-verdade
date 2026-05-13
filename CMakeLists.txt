cmake_minimum_required(VERSION 3.16)

project(Vigilia LANGUAGES NONE)

# Keep source and build trees separated to avoid polluting the repository.
if(CMAKE_SOURCE_DIR STREQUAL CMAKE_BINARY_DIR)
  message(FATAL_ERROR "In-source builds are not supported. Run: cmake -S . -B build")
endif()

find_program(PYTHON3_EXECUTABLE NAMES python3 python)
find_program(NPM_EXECUTABLE NAMES npm)

if(NOT PYTHON3_EXECUTABLE)
  message(FATAL_ERROR "Python was not found in PATH.")
endif()

if(NOT NPM_EXECUTABLE)
  message(FATAL_ERROR "npm was not found in PATH.")
endif()

add_custom_target(backend_deps
  COMMAND "${PYTHON3_EXECUTABLE}" -m pip install -r backend/requirements.txt
  WORKING_DIRECTORY "${CMAKE_SOURCE_DIR}"
  COMMENT "Installing backend dependencies"
  VERBATIM
)

add_custom_target(frontend_deps
  COMMAND "${NPM_EXECUTABLE}" install --legacy-peer-deps
  WORKING_DIRECTORY "${CMAKE_SOURCE_DIR}/frontend"
  COMMENT "Installing frontend dependencies"
  VERBATIM
)

add_custom_target(check
  COMMAND "${PYTHON3_EXECUTABLE}" -m py_compile backend/server.py
  COMMAND "${NPM_EXECUTABLE}" run -s build
  WORKING_DIRECTORY "${CMAKE_SOURCE_DIR}/frontend"
  COMMENT "Running basic backend/frontend checks"
  VERBATIM
)
