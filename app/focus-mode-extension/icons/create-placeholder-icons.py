#!/usr/bin/env python3
"""Create placeholder icons for Focus Mode extension"""

try:
    from PIL import Image, ImageDraw
    has_pil = True
except ImportError:
    has_pil = False
    print("PIL/Pillow not available, creating minimal icons...")

def create_icon(size, filename):
    """Create a simple icon"""
    if has_pil:
        # Use PIL to create better icons
        img = Image.new('RGBA', (size, size), (255, 255, 255, 255))
        draw = ImageDraw.Draw(img)
        
        # Draw outer circle
        margin = size // 32
        draw.ellipse([margin, margin, size-margin, size-margin], 
                    outline=(102, 126, 234, 255), width=max(1, size//32))
        
        # Draw inner circle
        inner_radius = size // 5
        draw.ellipse([size//2-inner_radius, size//2-inner_radius,
                     size//2+inner_radius, size//2+inner_radius],
                    fill=(102, 126, 234, 255))
        
        # Draw focus lines
        line_width = max(1, size // 32)
        for angle in [0, 90, 180, 270]:
            import math
            rad = math.radians(angle)
            x1 = size//2 + math.cos(rad) * (size//4)
            y1 = size//2 + math.sin(rad) * (size//4)
            x2 = size//2 + math.cos(rad) * (size//3)
            y2 = size//2 + math.sin(rad) * (size//3)
            draw.line([x1, y1, x2, y2], fill=(102, 126, 234, 255), width=line_width)
        
        img.save(filename)
        print(f"Created {filename}")
    else:
        # Create minimal PNG without PIL
        import struct
        import zlib
        
        # Simple 1x1 PNG
        width = height = size
        
        def create_simple_png(color=(102, 126, 234)):
            # Create a simple solid color PNG
            import io
            from base64 import b64encode
            
            # For simplicity, we'll create a minimal valid PNG
            # This is a basic implementation
            def png_chunk(chunk_type, data):
                import struct
                chunk_len = struct.pack('>I', len(data))
                chunk_crc = struct.pack('>I', zlib.crc32(chunk_type + data) & 0xffffffff)
                return chunk_len + chunk_type + data + chunk_crc
            
            # PNG signature
            png_signature = b'\x89PNG\r\n\x1a\n'
            
            # IHDR chunk
            ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)  # 8-bit RGBA
            ihdr = png_chunk(b'IHDR', ihdr_data)
            
            # IDAT chunk - solid color
            raw_data = b''
            for y in range(height):
                raw_data += b'\x00'  # Filter type
                for x in range(width):
                    raw_data += bytes([color[0], color[1], color[2], 255])  # RGBA
            
            compressed = zlib.compress(raw_data)
            idat = png_chunk(b'IDAT', compressed)
            
            # IEND chunk
            iend = png_chunk(b'IEND', b'')
            
            return png_signature + ihdr + idat + iend
        
        png_data = create_simple_png()
        with open(filename, 'wb') as f:
            f.write(png_data)
        print(f"Created {filename}")

# Create icons
for size in [16, 32, 48, 128]:
    create_icon(size, f'icon{size}.png')

print("Icon creation complete!")
