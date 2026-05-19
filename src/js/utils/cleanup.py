import os
import shutil

BASE_DIR = "styles"

for root, dirs, files in os.walk(BASE_DIR):
    for dir_name in dirs:
        dir_path = os.path.join(root, dir_name)

        # Obtener archivos dentro de la carpeta
        inner_files = os.listdir(dir_path)

        # Si solo tiene un archivo png
        png_files = [f for f in inner_files if f.endswith(".png")]

        if len(png_files) == 1:
            png_name = png_files[0]

            old_path = os.path.join(dir_path, png_name)
            new_path = os.path.join(root, png_name)

            # Evitar sobrescribir
            if not os.path.exists(new_path):
                print(f"Moviendo {old_path} -> {new_path}")

                shutil.move(old_path, new_path)

            # Eliminar carpeta vacía
            if len(os.listdir(dir_path)) == 0:
                print(f"Eliminando carpeta {dir_path}")

                os.rmdir(dir_path)

print("\nLimpieza completada.")