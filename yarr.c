/*******************************************************************************************
*
*   raylib [shaders] example - Apply a postprocessing shader to a scene
*
*   NOTE: This example requires raylib OpenGL 3.3 or ES2 versions for shaders support,
*         OpenGL 1.1 does not support shaders, recompile raylib to OpenGL 3.3 version.
*
*   NOTE: Shaders used in this example are #version 330 (OpenGL 3.3), to test this example
*         on OpenGL ES 2.0 platforms (Android, Raspberry Pi, HTML5), use #version 100 shaders
*         raylib comes with shaders ready for both versions, check raylib/shaders install folder
*
*   This example has been created using raylib 1.3 (www.raylib.com)
*   raylib is licensed under an unmodified zlib/libpng license (View raylib.h for details)
*
*   Copyright (c) 2015 Ramon Santamaria (@raysan5)
*
********************************************************************************************/

#include "raylib.h"
#include "raymath.h"
#include <string.h>

int main()
{
    // Initialization
    //--------------------------------------------------------------------------------------
    int screenWidth = 800;
    int screenHeight = 450;

    SetConfigFlags(FLAG_MSAA_4X_HINT);      // Enable Multi Sampling Anti Aliasing 4x (if available)

    InitWindow(screenWidth, screenHeight, "Ray marching test");

    Shader shader = LoadShader("shaders/base.vert",
                               "shaders/raymarch.frag");       // Load postpro shader
    int viewMatrixInvLoc = GetShaderLocation(shader, "viewMatrixInv");
    int FOVLoc = GetShaderLocation(shader, "FOV");

    Camera camera = {{ 0.0f, 0.0f, 0.0f }, { 1.0f, 1.0f, 10.0f }, { 0.0f, 1.0f, 0.0f }, 45.0f};
    //printf("%f,%f,%f\n", camera.position.x, camera.position.y, camera.position.z);
    SetCameraMode(camera, CAMERA_FREE);

    SetTargetFPS(60);                       // Set our game to run at 60 frames-per-second
    //--------------------------------------------------------------------------------------

    // Main game loop
    while (!WindowShouldClose())            // Detect window close button or ESC key
    {
        // Update
        //----------------------------------------------------------------------------------
        //

        UpdateCamera(&camera);              // Update camera

      //  printf("%f,%f,%f\n", camera.position.x, camera.position.y, camera.position.z);

        ClearBackground(RAYWHITE);

        Matrix viewMatrixInv = GetCameraMatrix(camera);
        MatrixInvert(&viewMatrixInv);

        //----------------------------------------------------------------------------------

        // Draw
        //----------------------------------------------------------------------------------
        BeginDrawing();
    
            SetShaderValueMatrix(shader, viewMatrixInvLoc, viewMatrixInv);
            SetShaderValue(shader, FOVLoc, &(camera.fovy), 1);

            BeginShaderMode(shader);
                DrawRectangle(0, 0, screenWidth, screenHeight, RED);

            EndShaderMode();

            DrawText("Raymarching test - JFonS", screenWidth - 145, screenHeight - 20, 10, DARKGRAY);

            DrawFPS(10, 10);

        EndDrawing();
        //----------------------------------------------------------------------------------
    }

    // De-Initialization
    //--------------------------------------------------------------------------------------
    UnloadShader(shader);           // Unload shader

    CloseWindow();                  // Close window and OpenGL context
    //--------------------------------------------------------------------------------------

    return 0;
}
