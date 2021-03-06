include(CMakeSources.cmake)
#project(ExampleStarting)

set(EXAMPLE_STARTING_INCLUDES "${PROJECT_SOURCE_DIR}/Sources/ExampleStarting/")

#if(FLOUNDER_CONFIG_RELEASE AND WIN32)
#	add_executable(ExampleStarting WIN32 ${EXAMPLE_STARTING_SOURCES})
#else()
add_executable(ExampleStarting ${EXAMPLE_STARTING_SOURCES})
#endif()

add_dependencies(ExampleStarting FlounderEngine)

target_include_directories(ExampleStarting PUBLIC ${LIBRARIES_INCLUDES} "${PROJECT_SOURCE_DIR}/Sources/FlounderEngine/" ${EXAMPLE_STARTING_INCLUDES})
target_link_libraries(ExampleStarting PRIVATE ${LIBRARIES_LINKS} FlounderEngine)

# Install
if (FLOUNDER_INSTALL)
    install(
            DIRECTORY .
            DESTINATION include
            FILES_MATCHING PATTERN "*.h"
            PATTERN "Private" EXCLUDE
    )

    install(
            TARGETS ExampleStarting
            RUNTIME DESTINATION bin
            LIBRARY DESTINATION lib
            ARCHIVE DESTINATION lib
    )
endif()

# Shaders
#if(WIN32)
#    add_custom_command(TARGET FlounderEngine
#            POST_BUILD
#            COMMAND cmd /c ${PROJECT_SOURCE_DIR}/Scripts/build_shaders.bat
#    )
#else()
#   add_custom_command(TARGET FlounderEngine
#           POST_BUILD
#           COMMAND cmd /c ${PROJECT_SOURCE_DIR}/Scripts/build_shaders.sh
#   )
#endif()
